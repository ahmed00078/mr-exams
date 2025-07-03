'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Search,
    Trophy,
    Users,
    TrendingUp,
    MapPin,
    Building,
    GraduationCap,
    Medal,
    Star,
    Award,
    Eye,
    Download
} from 'lucide-react';
import { sessionsApi, resultsApi, statsApi } from '@/lib/api';
import { Session, ExamResult, SearchParams } from '@/types';
import { formatTauxReussite, formatMoyenne, getDecisionBadgeColor } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

interface GlobalStats {
    total_candidats: number;
    total_admis: number;
    taux_reussite_global: number;
    wilayas: Array<{
        id: number;
        name_fr: string;
        candidats: number;
        admis: number;
        taux_reussite: number;
    }>;
    series: Array<{
        id: number;
        code: string;
        name_fr: string;
        candidats: number;
        admis: number;
        taux_reussite: number;
    }>;
}

export default function ExamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = parseInt(params.id as string);

    // États principaux
    const [session, setSession] = useState<Session | null>(null);
    const [topCandidates, setTopCandidates] = useState<ExamResult[]>([]);
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<ExamResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Charger les données de la session
    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                // Récupérer toutes les sessions pour trouver celle avec l'ID
                const sessions = await sessionsApi.getPublished();
                const currentSession = sessions.find(s => s.id === sessionId);

                if (!currentSession) {
                    throw new Error('Session non trouvée');
                }

                setSession(currentSession);

                // Récupérer les statistiques globales
                const [statsData, topResults] = await Promise.all([
                    statsApi.getGlobalStats(currentSession.year, currentSession.exam_type),
                    loadTopCandidates(currentSession.id)
                ]);

                setGlobalStats(statsData);
                setTopCandidates(topResults);

            } catch (err) {
                console.error('Erreur lors du chargement:', err);
                setError('Impossible de charger les données de l\'examen');
            } finally {
                setIsLoading(false);
            }
        };

        if (sessionId) {
            fetchSessionData();
        }
    }, [sessionId]);

    // Charger le top des candidats
    const loadTopCandidates = async (sessionId: number): Promise<ExamResult[]> => {
        const searchParams: SearchParams = {
            year: session?.year || new Date().getFullYear(),
            exam_type: session?.exam_type || 'bac',
            page: 1,
            size: 50 // Top 50
        };

        const response = await resultsApi.search(searchParams);

        // Trier par moyenne décroissante
        return response.results
            .filter(r => r.moyenne_generale !== null && r.moyenne_generale !== undefined)
            .sort((a, b) => (b.moyenne_generale || 0) - (a.moyenne_generale || 0))
            .slice(0, 20); // Top 20 seulement
    };

    // Recherche de candidats
    const handleSearch = async (term: string) => {
        if (!term.trim() || !session) return;

        setIsSearching(true);
        try {
            const searchParams: SearchParams = {
                nom: term,
                year: session.year,
                exam_type: session.exam_type,
                page: 1,
                size: 20
            };

            const response = await resultsApi.search(searchParams);
            setSearchResults(response.results);
        } catch (err) {
            console.error('Erreur lors de la recherche:', err);
        } finally {
            setIsSearching(false);
        }
    };

    // Rendu du chargement
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="large" text="Chargement de l'examen..." />
            </div>
        );
    }

    // Rendu d'erreur
    if (error || !session) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-red-800 mb-4">Erreur</h2>
                        <p className="text-red-700 mb-6">{error}</p>
                        <Link href="/" className="btn-primary">
                            Retour à l'accueil
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const getExamTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            'bac': 'Baccalauréat',
            'bepc': 'BEPC',
            'concours': 'Concours'
        };
        return labels[type] || type.toUpperCase();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* En-tête */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/"
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Retour</span>
                            </Link>

                            <div className="flex items-center space-x-3">
                                <GraduationCap className="w-8 h-8 text-blue-600" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {getExamTypeLabel(session.exam_type)} {session.year}
                                    </h1>
                                    <p className="text-gray-600">{session.session_name}</p>
                                </div>
                            </div>
                        </div>

                        {session.publication_date && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Publié le</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(session.publication_date).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Statistiques principales */}
                {globalStats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center">
                                <Users className="w-10 h-10 text-blue-500 mr-4" />
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {globalStats.total_candidats.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600">Total candidats</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center">
                                <Award className="w-10 h-10 text-green-500 mr-4" />
                                <div>
                                    <p className="text-3xl font-bold text-green-600">
                                        {globalStats.total_admis.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600">Candidats admis</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center">
                                <TrendingUp className="w-10 h-10 text-blue-600 mr-4" />
                                <div>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {formatTauxReussite(globalStats.taux_reussite_global)}
                                    </p>
                                    <p className="text-sm text-gray-600">Taux de réussite</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center">
                                <MapPin className="w-10 h-10 text-purple-500 mr-4" />
                                <div>
                                    <p className="text-3xl font-bold text-purple-600">
                                        {globalStats.wilayas.length}
                                    </p>
                                    <p className="text-sm text-gray-600">Wilayas participantes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Section principale - Top candidats */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <Trophy className="w-6 h-6 text-yellow-500" />
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Meilleurs Résultats
                                    </h2>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Top {topCandidates.length} candidats
                                </div>
                            </div>

                            <div className="space-y-3">
                                {topCandidates.map((candidate, index) => (
                                    <Link
                                        key={candidate.id}
                                        href={`/result/${candidate.id}`}
                                        className="block hover:bg-gray-50 rounded-lg p-4 transition-colors border border-gray-100 hover:border-gray-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                {/* Position */}
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                        index === 1 ? 'bg-gray-100 text-gray-800' :
                                                            index === 2 ? 'bg-orange-100 text-orange-800' :
                                                                'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {index < 3 ? (
                                                        index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </div>

                                                {/* Informations candidat */}
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {candidate.nom_complet_fr}
                                                    </h3>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        {candidate.wilaya && (
                                                            <span className="flex items-center">
                                                                <MapPin className="w-3 h-3 mr-1" />
                                                                {candidate.wilaya.name_fr}
                                                            </span>
                                                        )}
                                                        {candidate.etablissement && (
                                                            <span className="flex items-center">
                                                                <Building className="w-3 h-3 mr-1" />
                                                                {candidate.etablissement.name_fr.substring(0, 30)}...
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                {/* Moyenne */}
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {formatMoyenne(candidate.moyenne_generale)}
                                                    </p>
                                                    <p className={`text-sm font-medium ${getDecisionBadgeColor(candidate.decision).includes('green') ? 'text-green-600' : 'text-red-600'}`}>
                                                        {candidate.decision}
                                                    </p>
                                                </div>

                                                {/* Classements */}
                                                {(candidate.rang_national || candidate.rang_wilaya) && (
                                                    <div className="text-right text-xs text-gray-500">
                                                        {candidate.rang_national && (
                                                            <div>#{candidate.rang_national} national</div>
                                                        )}
                                                        {candidate.rang_wilaya && (
                                                            <div>#{candidate.rang_wilaya} wilaya</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {topCandidates.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>Aucun résultat disponible pour le moment</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Recherche et statistiques */}
                    <div className="space-y-6">
                        {/* Recherche */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <Search className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Rechercher un candidat
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Nom du candidat..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                                    className="form-input"
                                />

                                <button
                                    onClick={() => handleSearch(searchTerm)}
                                    disabled={isSearching || !searchTerm.trim()}
                                    className="w-full btn-primary disabled:opacity-50"
                                >
                                    {isSearching ? 'Recherche...' : 'Rechercher'}
                                </button>

                                {/* Résultats de recherche */}
                                {searchResults.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h4 className="font-medium text-gray-700">Résultats :</h4>
                                        {searchResults.slice(0, 5).map((result) => (
                                            <Link
                                                key={result.id}
                                                href={`/result/${result.id}`}
                                                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="font-medium text-gray-900">
                                                    {result.nom_complet_fr}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {formatMoyenne(result.moyenne_generale)} - {result.decision}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Statistiques par série */}
                        {globalStats && globalStats.series.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Résultats par Série
                                </h3>

                                <div className="space-y-3">
                                    {globalStats.series
                                        .sort((a, b) => b.taux_reussite - a.taux_reussite)
                                        .slice(0, 5)
                                        .map((serie) => (
                                            <div key={serie.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {serie.name_fr}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {serie.candidats} candidats
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-blue-600">
                                                        {formatTauxReussite(serie.taux_reussite)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {serie.admis} admis
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}