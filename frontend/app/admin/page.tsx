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
    Lock,
    Plus,
    Calendar,
    Globe,
    EyeIcon,
    Settings
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

    // États de création de session
    const [showCreateSession, setShowCreateSession] = useState(false);
    const [sessionForm, setSessionForm] = useState({
        year: new Date().getFullYear(),
        exam_type: 'bac',
        session_name: '',
        start_date: '',
        end_date: '',
        publication_date: '',
        is_published: true,
        is_archived: false
    });
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const [sessionError, setSessionError] = useState<string | null>(null);
    const [sessionSuccess, setSessionSuccess] = useState<string | null>(null);
    const [updatingSessionId, setUpdatingSessionId] = useState<number | null>(null);

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

    // Création de session
    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        setIsCreatingSession(true);
        setSessionError(null);
        setSessionSuccess(null);

        try {
            // Préparer les données avec formatage des dates
            const sessionData = {
                ...sessionForm,
                // Convertir datetime-local en format attendu par le backend
                publication_date: sessionForm.publication_date ? 
                    sessionForm.publication_date.replace('T', ' ') : undefined,
                // Les dates de début/fin sont déjà au bon format YYYY-MM-DD
                start_date: sessionForm.start_date || undefined,
                end_date: sessionForm.end_date || undefined
            };

            const newSession = await adminApi.createSession(sessionData, token);
            setSessions(prev => [newSession, ...prev]);
            setSessionSuccess(`Session "${sessionForm.session_name}" créée avec succès`);
            setSessionForm({
                year: new Date().getFullYear(),
                exam_type: 'bac',
                session_name: '',
                start_date: '',
                end_date: '',
                publication_date: '',
                is_published: true,
                is_archived: false
            });
            setShowCreateSession(false);
            
            // Auto-sélectionner la nouvelle session
            setSelectedSession(newSession.id);
        } catch (error: any) {
            if (error.message.includes('existe déjà')) {
                setSessionError('Une session pour cette année existe déjà');
            } else if (error.message.includes('Format de date')) {
                setSessionError('Format de date invalide. Vérifiez les dates saisies.');
            } else {
                setSessionError('Erreur lors de la création de la session');
            }
        } finally {
            setIsCreatingSession(false);
        }
    };

    // Changer le statut de publication d'une session
    const handleTogglePublication = async (sessionId: number, currentStatus: boolean) => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        setUpdatingSessionId(sessionId);
        setSessionError(null);

        try {
            const response = await adminApi.toggleSessionPublication(sessionId, !currentStatus, token);
            
            // Mettre à jour la session dans la liste
            setSessions(prev => prev.map(session => 
                session.id === sessionId 
                    ? { ...session, is_published: !currentStatus }
                    : session
            ));

            setSessionSuccess(response.message);
            
            // Effacer le message après 3 secondes
            setTimeout(() => setSessionSuccess(null), 3000);
        } catch (error: any) {
            setSessionError('Erreur lors de la mise à jour du statut');
        } finally {
            setUpdatingSessionId(null);
        }
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

                {/* Messages de succès/erreur globaux */}
                {sessionSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <p className="text-green-800">{sessionSuccess}</p>
                        </div>
                    </div>
                )}

                {/* Section gestion des sessions */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-6 h-6 text-green-600" />
                            <h2 className="text-xl font-bold text-gray-900">Gestion des sessions</h2>
                        </div>
                        <button
                            onClick={() => setShowCreateSession(!showCreateSession)}
                            className="btn-primary flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nouvelle session</span>
                        </button>
                    </div>

                    {/* Formulaire de création de session */}
                    {showCreateSession && (
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer une nouvelle session</h3>
                            
                            {sessionError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center space-x-2">
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                        <p className="text-red-800">{sessionError}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleCreateSession} className="space-y-6">
                                {/* Informations de base */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-800 mb-3">Informations générales</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Année
                                            </label>
                                            <input
                                                type="number"
                                                value={sessionForm.year}
                                                onChange={(e) => setSessionForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                                                className="form-input"
                                                min="2020"
                                                max="2030"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Type d'examen
                                            </label>
                                            <select
                                                value={sessionForm.exam_type}
                                                onChange={(e) => setSessionForm(prev => ({ ...prev, exam_type: e.target.value }))}
                                                className="form-select"
                                                required
                                            >
                                                <option value="bac">Baccalauréat</option>
                                                <option value="bem">BEM</option>
                                                <option value="bfem">BFEM</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nom de la session
                                            </label>
                                            <input
                                                type="text"
                                                value={sessionForm.session_name}
                                                onChange={(e) => setSessionForm(prev => ({ ...prev, session_name: e.target.value }))}
                                                className="form-input"
                                                placeholder="ex: Session principale"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-800 mb-3">Calendrier</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Date de début
                                            </label>
                                            <input
                                                type="date"
                                                value={sessionForm.start_date}
                                                onChange={(e) => setSessionForm(prev => ({ ...prev, start_date: e.target.value }))}
                                                className="form-input"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Date de fin
                                            </label>
                                            <input
                                                type="date"
                                                value={sessionForm.end_date}
                                                onChange={(e) => setSessionForm(prev => ({ ...prev, end_date: e.target.value }))}
                                                className="form-input"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Date de publication
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={sessionForm.publication_date}
                                                onChange={(e) => setSessionForm(prev => ({ ...prev, publication_date: e.target.value }))}
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Options */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-800 mb-3">Options</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id="is_published"
                                                checked={sessionForm.is_published}
                                                onChange={(e) => setSessionForm(prev => ({ ...prev, is_published: e.target.checked }))}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                                                Session publiée (visible au public)
                                            </label>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id="is_archived"
                                                checked={sessionForm.is_archived}
                                                onChange={(e) => setSessionForm(prev => ({ ...prev, is_archived: e.target.checked }))}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="is_archived" className="text-sm font-medium text-gray-700">
                                                Session archivée
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <button
                                        type="submit"
                                        disabled={isCreatingSession}
                                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isCreatingSession ? (
                                            <div className="flex items-center space-x-2">
                                                <LoadingSpinner size="small" />
                                                <span>Création...</span>
                                            </div>
                                        ) : (
                                            'Créer la session'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateSession(false);
                                            setSessionError(null);
                                        }}
                                        className="btn-secondary"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Liste des sessions existantes */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessions existantes</h3>
                        <div className="max-h-96 overflow-y-auto">
                            {sessions.length > 0 ? (
                                <div className="space-y-3">
                                    {sessions.map(session => (
                                        <div key={session.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-3 h-3 rounded-full ${session.is_published ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                {session.exam_type.toUpperCase()} {session.year}
                                                            </p>
                                                            <p className="text-sm text-gray-600">{session.session_name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                                        <span className="flex items-center">
                                                            <Users className="w-3 h-3 mr-1" />
                                                            {session.total_candidates.toLocaleString()} candidats
                                                        </span>
                                                        {session.start_date && (
                                                            <span className="flex items-center">
                                                                <Calendar className="w-3 h-3 mr-1" />
                                                                {new Date(session.start_date).toLocaleDateString('fr-FR')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2">
                                                    {/* Statut visuel */}
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        session.is_published 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {session.is_published ? 'Publiée' : 'Brouillon'}
                                                    </span>
                                                    
                                                    {/* Bouton de basculement */}
                                                    <button
                                                        onClick={() => handleTogglePublication(session.id, session.is_published)}
                                                        disabled={updatingSessionId === session.id}
                                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                                            session.is_published
                                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1`}
                                                        title={session.is_published ? 'Retirer la session' : 'Publier la session'}
                                                    >
                                                        {updatingSessionId === session.id ? (
                                                            <LoadingSpinner size="small" />
                                                        ) : session.is_published ? (
                                                            <>
                                                                <EyeOff className="w-3 h-3" />
                                                                <span>Retirer</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Globe className="w-3 h-3" />
                                                                <span>Publier</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">Aucune session disponible</p>
                            )}
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