'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Shield,
    Upload,
    Users,
    FileText,
    CheckCircle,
    AlertCircle,
    X,
    Eye,
    EyeOff,
    Lock
} from 'lucide-react';
import { adminApi, authApi, sessionsApi } from '@/lib/api';
import { BulkUploadStatus, Session, Token } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SecureAdminPage() {
    const router = useRouter();

    // États d'authentification
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // États d'upload
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedSession, setSelectedSession] = useState<number | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<BulkUploadStatus | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Vérification auth au montage
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            setIsAuthenticated(true);
            loadSessions();
        }
    }, []);

    // Charger les sessions
    const loadSessions = async () => {
        try {
            const data = await sessionsApi.getPublished();
            setSessions(data);
            if (data.length > 0) {
                setSelectedSession(data[0].id);
            }
        } catch (error) {
            console.error('Erreur sessions:', error);
        }
    };

    // Connexion
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setLoginError(null);

        try {
            const authData: Token = await authApi.login(loginForm.username, loginForm.password);
            localStorage.setItem('admin_token', authData.access_token);
            setIsAuthenticated(true);
            await loadSessions();
        } catch (error) {
            setLoginError('Identifiants incorrects');
        } finally {
            setIsLoggingIn(false);
        }
    };

    // Déconnexion
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
        setLoginForm({ username: '', password: '' });
        router.push('/');
    };

    // Upload
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = [
                'text/csv',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];

            if (allowedTypes.includes(file.type)) {
                setSelectedFile(file);
                setUploadError(null);
            } else {
                setUploadError('Format non supporté. Utilisez CSV ou Excel');
                setSelectedFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !selectedSession) return;

        const token = localStorage.getItem('admin_token');
        if (!token) return;

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

            monitorProgress(response.task_id, token);
        } catch (error) {
            setUploadError('Erreur lors de l\'upload');
        } finally {
            setIsUploading(false);
        }
    };

    const monitorProgress = async (taskId: string, token: string) => {
        const interval = setInterval(async () => {
            try {
                const status = await adminApi.getUploadStatus(taskId, token);
                setUploadStatus(status);

                if (status.status === 'completed' || status.status === 'failed') {
                    clearInterval(interval);
                }
            } catch (error) {
                clearInterval(interval);
            }
        }, 2000);
    };

    // Page de connexion
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-xl shadow-2xl p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Zone Réservée</h1>
                            <p className="text-gray-600">Administration du système</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {loginError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-2">
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                        <p className="text-red-800 text-sm">{loginError}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom d'utilisateur
                                </label>
                                <input
                                    type="text"
                                    value={loginForm.username}
                                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                                    className="form-input"
                                    required
                                    autoComplete="username"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={loginForm.password}
                                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                                        className="form-input pr-10"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
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
                                        <Lock className="w-5 h-5" />
                                        <span>Se connecter</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                            <button
                                onClick={() => router.push('/')}
                                className="text-gray-500 hover:text-gray-700 text-sm"
                            >
                                ← Retour au portail public
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Interface d'administration
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* En-tête */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <Shield className="w-8 h-8 text-red-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/')}
                            className="btn-secondary"
                        >
                            Portail Public
                        </button>
                        <button
                            onClick={handleLogout}
                            className="btn-primary flex items-center space-x-2"
                        >
                            <X className="w-4 h-4" />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center">
                            <FileText className="w-10 h-10 text-blue-500 mr-4" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
                                <p className="text-sm text-gray-600">Sessions disponibles</p>
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
                            <Upload className="w-10 h-10 text-purple-500 mr-4" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {uploadStatus ? 1 : 0}
                                </p>
                                <p className="text-sm text-gray-600">Upload actif</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section upload */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <Upload className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Upload de résultats</h2>
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
                            {/* Sélection session */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Session d'examen
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

                            {/* Upload fichier */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fichier de résultats
                                </label>
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileSelect}
                                    className="form-input"
                                />

                                {selectedFile && (
                                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
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

                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || !selectedSession || isUploading}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading ? 'Upload en cours...' : 'Lancer l\'upload'}
                            </button>
                        </div>
                    ) : (
                        // Status upload
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Statut de l'upload</h3>
                                <button
                                    onClick={() => {
                                        setUploadStatus(null);
                                        setSelectedFile(null);
                                    }}
                                    className="btn-secondary"
                                >
                                    Nouvel upload
                                </button>
                            </div>

                            <div className="bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all duration-500 ${uploadStatus.status === 'completed' ? 'bg-green-500' :
                                            uploadStatus.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${uploadStatus.progress}%` }}
                                ></div>
                            </div>

                            <div className="grid grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{uploadStatus.total_rows}</p>
                                    <p className="text-sm text-gray-600">Total</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-blue-600">{uploadStatus.processed_rows}</p>
                                    <p className="text-sm text-blue-800">Traitées</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{uploadStatus.success_count}</p>
                                    <p className="text-sm text-green-800">Succès</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-red-600">{uploadStatus.error_count}</p>
                                    <p className="text-sm text-red-800">Erreurs</p>
                                </div>
                            </div>

                            {uploadStatus.errors.length > 0 && (
                                <div className="bg-red-50 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-red-900 mb-2">Erreurs:</h4>
                                    <div className="max-h-32 overflow-y-auto">
                                        <ul className="text-xs text-red-800 space-y-1">
                                            {uploadStatus.errors.slice(0, 5).map((error, index) => (
                                                <li key={index}>• {error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}