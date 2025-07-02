'use client';

import { useState, useEffect } from 'react';
import {
    Upload,
    Settings,
    Users,
    FileText,
    CheckCircle,
    AlertCircle,
    Clock,
    X,
    Eye,
    Download,
    RefreshCw
} from 'lucide-react';
import { adminApi, authApi, sessionsApi } from '@/lib/api';
import { BulkUploadStatus, Session, Token } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminPage() {
    // États d'authentification
    const [token, setToken] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // États d'upload
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedSession, setSelectedSession] = useState<number | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<BulkUploadStatus | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Vérifier l'authentification au montage
    useEffect(() => {
        const savedToken = localStorage.getItem('admin_token');
        if (savedToken) {
            setToken(savedToken);
            setIsLoggedIn(true);
            loadSessions();
        }
    }, []);

    // Charger les sessions
    const loadSessions = async () => {
        try {
            const sessionsData = await sessionsApi.getPublished();
            setSessions(sessionsData);
            if (sessionsData.length > 0) {
                setSelectedSession(sessionsData[0].id);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des sessions:', error);
        }
    };

    // Connexion
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setLoginError(null);

        try {
            const authData: Token = await authApi.login(loginForm.username, loginForm.password);
            setToken(authData.access_token);
            setIsLoggedIn(true);
            localStorage.setItem('admin_token', authData.access_token);
            await loadSessions();
        } catch (error) {
            console.error('Erreur de connexion:', error);
            setLoginError('Nom d\'utilisateur ou mot de passe incorrect');
        } finally {
            setIsLoggingIn(false);
        }
    };

    // Déconnexion
    const handleLogout = () => {
        setToken(null);
        setIsLoggedIn(false);
        localStorage.removeItem('admin_token');
        setLoginForm({ username: '', password: '' });
    };

    // Sélection de fichier
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Vérifier le type de fichier
            const allowedTypes = [
                'text/csv',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];

            if (allowedTypes.includes(file.type)) {
                setSelectedFile(file);
                setUploadError(null);
            } else {
                setUploadError('Type de fichier non supporté. Utilisez CSV ou Excel (.xlsx, .xls)');
                setSelectedFile(null);
            }
        }
    };

    // Upload du fichier
    const handleUpload = async () => {
        if (!selectedFile || !selectedSession || !token) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const response = await adminApi.uploadResults(selectedFile, selectedSession, token);
            setUploadStatus({
                task_id: response.task_id,
                status: 'processing',
                progress: 0,
                total_rows: response.total_rows,
                processed_rows: 0,
                success_count: 0,
                error_count: 0,
                errors: []
            });

            // Surveiller le progrès
            monitorUploadProgress(response.task_id);
        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
            setUploadError('Erreur lors de l\'upload du fichier');
        } finally {
            setIsUploading(false);
        }
    };

    // Surveiller le progrès de l'upload
    const monitorUploadProgress = async (taskId: string) => {
        const interval = setInterval(async () => {
            try {
                if (!token) return;

                const status = await adminApi.getUploadStatus(taskId, token);
                setUploadStatus(status);

                if (status.status === 'completed' || status.status === 'failed') {
                    clearInterval(interval);
                }
            } catch (error) {
                console.error('Erreur lors de la surveillance du progrès:', error);
                clearInterval(interval);
            }
        }, 2000);

        // Nettoyer l'intervalle après 10 minutes
        setTimeout(() => clearInterval(interval), 600000);
    };

    // Réinitialiser l'upload
    const resetUpload = () => {
        setSelectedFile(null);
        setUploadStatus(null);
        setUploadError(null);
    };

    // Page de connexion
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                        <div className="text-center mb-8">
                            <div className="mauritania-flag w-12 h-9 mx-auto mb-4"></div>
                            <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
                            <p className="text-gray-600">Portail des Résultats d&apos;Examens</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {loginError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800 text-sm">{loginError}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom d&apos;utilisateur
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={loginForm.username}
                                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Mot de passe
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={loginForm.password}
                                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full btn-primary flex items-center justify-center space-x-2"
                            >
                                {isLoggingIn ? (
                                    <LoadingSpinner size="small" />
                                ) : (
                                    <>
                                        <Settings className="w-5 h-5" />
                                        <span>Se connecter</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Page d'administration
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* En-tête */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <Settings className="w-8 h-8 text-mauritania-primary" />
                        <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn-secondary flex items-center space-x-2"
                    >
                        <X className="w-4 h-4" />
                        <span>Déconnexion</span>
                    </button>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center">
                            <FileText className="w-10 h-10 text-blue-500 mr-4" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
                                <p className="text-sm text-gray-600">Sessions actives</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center">
                            <Users className="w-10 h-10 text-green-500 mr-4" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {sessions.reduce((total, s) => total + s.total_candidates, 0).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">Total candidats</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center">
                            <CheckCircle className="w-10 h-10 text-mauritania-primary mr-4" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {sessions.filter(s => s.is_published).length}
                                </p>
                                <p className="text-sm text-gray-600">Sessions publiées</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center">
                            <Upload className="w-10 h-10 text-purple-500 mr-4" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {uploadStatus ? 1 : 0}
                                </p>
                                <p className="text-sm text-gray-600">Upload en cours</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section d'upload */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <Upload className="w-6 h-6 text-mauritania-primary" />
                        <h2 className="text-xl font-bold text-gray-900">Upload de résultats en masse</h2>
                    </div>

                    {uploadError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center space-x-2">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <p className="text-red-800">{uploadError}</p>
                            </div>
                        </div>
                    )}

                    {!uploadStatus ? (
                        <div className="space-y-6">
                            {/* Sélection de session */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Session d&apos;examen
                                </label>
                                <select
                                    value={selectedSession || ''}
                                    onChange={(e) => setSelectedSession(Number(e.target.value))}
                                    className="form-select"
                                >
                                    <option value="">Sélectionner une session</option>
                                    {sessions.map(session => (
                                        <option key={session.id} value={session.id}>
                                            {session.exam_type.toUpperCase()} {session.year} - {session.session_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sélection de fichier */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fichier de résultats
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-mauritania-primary hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                            >
                                                <span>Télécharger un fichier</span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    accept=".csv,.xlsx,.xls"
                                                    onChange={handleFileSelect}
                                                />
                                            </label>
                                            <p className="pl-1">ou glisser-déposer</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            CSV, XLSX, XLS jusqu&apos;à 50MB
                                        </p>
                                    </div>
                                </div>

                                {selectedFile && (
                                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <FileText className="w-5 h-5 text-green-500" />
                                            <div>
                                                <p className="text-sm font-medium text-green-800">{selectedFile.name}</p>
                                                <p className="text-xs text-green-600">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-blue-900 mb-2">Format attendu:</h3>
                                <ul className="text-xs text-blue-800 space-y-1">
                                    <li>• <strong>NNI:</strong> Numéro National d&apos;Identification</li>
                                    <li>• <strong>NOMPL:</strong> Nom complet en français</li>
                                    <li>• <strong>NODOSS:</strong> Numéro de dossier (optionnel)</li>
                                    <li>• <strong>Decision:</strong> Admis, Ajourné, Passable, etc.</li>
                                    <li>• <strong>MOYBAC/MOYG:</strong> Moyenne générale (optionnel)</li>
                                    <li>• <strong>SERIE:</strong> Code de la série (optionnel)</li>
                                </ul>
                            </div>

                            {/* Bouton d'upload */}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleUpload}
                                    disabled={!selectedFile || !selectedSession || isUploading}
                                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUploading ? (
                                        <LoadingSpinner size="small" />
                                    ) : (
                                        <Upload className="w-5 h-5" />
                                    )}
                                    <span>{isUploading ? 'Upload en cours...' : 'Lancer l\'upload'}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Status de l'upload
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Statut de l&apos;upload</h3>
                                <button
                                    onClick={resetUpload}
                                    className="btn-secondary flex items-center space-x-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Nouvel upload</span>
                                </button>
                            </div>

                            {/* Barre de progression */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Progression</span>
                                    <span className="text-sm text-gray-500">{uploadStatus.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${uploadStatus.status === 'completed' ? 'bg-green-500' :
                                                uploadStatus.status === 'failed' ? 'bg-red-500' :
                                                    'bg-blue-500'
                                            }`}
                                        style={{ width: `${uploadStatus.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Statistiques */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-gray-900">{uploadStatus.total_rows}</p>
                                    <p className="text-sm text-gray-600">Total lignes</p>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-blue-600">{uploadStatus.processed_rows}</p>
                                    <p className="text-sm text-blue-800">Traitées</p>
                                </div>

                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-green-600">{uploadStatus.success_count}</p>
                                    <p className="text-sm text-green-800">Succès</p>
                                </div>

                                <div className="bg-red-50 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-red-600">{uploadStatus.error_count}</p>
                                    <p className="text-sm text-red-800">Erreurs</p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center space-x-2">
                                {uploadStatus.status === 'processing' && (
                                    <>
                                        <Clock className="w-5 h-5 text-blue-500 animate-spin" />
                                        <span className="text-blue-700">Traitement en cours...</span>
                                    </>
                                )}

                                {uploadStatus.status === 'completed' && (
                                    <>
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span className="text-green-700">Upload terminé avec succès!</span>
                                    </>
                                )}

                                {uploadStatus.status === 'failed' && (
                                    <>
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                        <span className="text-red-700">Échec de l&apos;upload</span>
                                    </>
                                )}
                            </div>

                            {/* Erreurs */}
                            {uploadStatus.errors.length > 0 && (
                                <div className="bg-red-50 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-red-900 mb-2">Erreurs détectées:</h4>
                                    <div className="max-h-40 overflow-y-auto">
                                        <ul className="text-xs text-red-800 space-y-1">
                                            {uploadStatus.errors.slice(0, 10).map((error, index) => (
                                                <li key={index}>• {error}</li>
                                            ))}
                                            {uploadStatus.errors.length > 10 && (
                                                <li className="font-medium">... et {uploadStatus.errors.length - 10} autres erreurs</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Liste des sessions */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <FileText className="w-6 h-6 text-mauritania-primary" />
                        <h2 className="text-xl font-bold text-gray-900">Sessions d&apos;examens</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Session
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Candidats
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Admis
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Taux de réussite
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {session.session_name} {session.year}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {session.id}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {session.exam_type.toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {session.total_candidates.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                            {session.total_passed.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {/* {session.pass_rate?.toFixed(1)}% */}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${session.is_published
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {session.is_published ? 'Publiée' : 'En attente'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}