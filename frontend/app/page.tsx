'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    GraduationCap,
    Calendar,
    Users,
    Trophy,
    TrendingUp,
    ChevronRight,
    BookOpen,
    Award
} from 'lucide-react';
import { sessionsApi } from '@/lib/api';
import { Session } from '@/types';
import { formatTauxReussite } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await sessionsApi.getPublished();
                // Trier par année décroissante puis par taux de réussite
                const sortedSessions = data.sort((a, b) => {
                    if (b.year !== a.year) return b.year - a.year;
                    return (b.pass_rate || 0) - (a.pass_rate || 0);
                });
                setSessions(sortedSessions);
            } catch (err) {
                console.error('Erreur lors du chargement des sessions:', err);
                setError('Impossible de charger les examens');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const getExamTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            'bac': 'Baccalauréat',
            'bepc': 'BEPC',
            'concours': 'Concours'
        };
        return labels[type] || type.toUpperCase();
    };

    const getExamTypeIcon = (type: string) => {
        switch (type) {
            case 'bac': return GraduationCap;
            case 'bepc': return BookOpen;
            case 'concours': return Award;
            default: return GraduationCap;
        }
    };

    const getExamTypeColor = (type: string): string => {
        switch (type) {
            case 'bac': return 'from-blue-500 to-blue-600';
            case 'bepc': return 'from-green-500 to-green-600';
            case 'concours': return 'from-purple-500 to-purple-600';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="large" text="Chargement des examens..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">{error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="mauritania-flag w-16 h-12"></div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Résultats d'Examens
                        </h1>

                        <p className="text-xl text-blue-100 mb-2">
                            République Islamique de Mauritanie
                        </p>

                        <p className="text-lg text-blue-200 max-w-2xl mx-auto">
                            Consultez les résultats officiels des examens mauritaniens
                        </p>
                    </div>
                </div>
            </section>

            {/* Liste des Examens */}
            <section className="py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Examens Disponibles
                        </h2>
                        <p className="text-lg text-gray-600">
                            Cliquez sur un examen pour voir les résultats et statistiques
                        </p>
                    </div>

                    {sessions.length === 0 ? (
                        <div className="text-center py-12">
                            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                Aucun examen disponible
                            </h3>
                            <p className="text-gray-500">
                                Les résultats d'examens seront publiés ici dès qu'ils seront disponibles.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sessions.map((session) => {
                                const ExamIcon = getExamTypeIcon(session.exam_type);
                                const gradientColor = getExamTypeColor(session.exam_type);

                                return (
                                    <Link
                                        key={session.id}
                                        href={`/exam/${session.id}`}
                                        className="group"
                                    >
                                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                            {/* En-tête avec gradient */}
                                            <div className={`bg-gradient-to-r ${gradientColor} p-6 text-white`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <ExamIcon className="w-8 h-8" />
                                                        <div>
                                                            <h3 className="text-xl font-bold">
                                                                {getExamTypeLabel(session.exam_type)}
                                                            </h3>
                                                            <p className="text-sm opacity-90">
                                                                {session.year} - {session.session_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>

                                            {/* Contenu */}
                                            <div className="p-6">
                                                {/* Statistiques principales */}
                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <div className="text-center">
                                                        <div className="flex items-center justify-center mb-2">
                                                            <Users className="w-5 h-5 text-gray-400 mr-2" />
                                                        </div>
                                                        <p className="text-2xl font-bold text-gray-900">
                                                            {session.total_candidates.toLocaleString()}
                                                        </p>
                                                        <p className="text-sm text-gray-500">Candidats</p>
                                                    </div>

                                                    <div className="text-center">
                                                        <div className="flex items-center justify-center mb-2">
                                                            <Trophy className="w-5 h-5 text-green-500 mr-2" />
                                                        </div>
                                                        <p className="text-2xl font-bold text-green-600">
                                                            {session.total_passed.toLocaleString()}
                                                        </p>
                                                        <p className="text-sm text-gray-500">Admis</p>
                                                    </div>
                                                </div>

                                                {/* Taux de réussite */}
                                                <div className="text-center mb-4">
                                                    <div className="inline-flex items-center bg-blue-50 rounded-full px-4 py-2">
                                                        <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
                                                        <span className="text-lg font-bold text-blue-600">
                                                            {formatTauxReussite(session.pass_rate)}
                                                        </span>
                                                        <span className="text-sm text-blue-600 ml-1">de réussite</span>
                                                    </div>
                                                </div>

                                                {/* Date de publication */}
                                                {session.publication_date && (
                                                    <div className="flex items-center justify-center text-sm text-gray-500">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        <span>
                                                            Publié le {new Date(session.publication_date).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Badge "Récent" pour les examens de cette année */}
                                                {session.year === new Date().getFullYear() && (
                                                    <div className="absolute top-4 right-4">
                                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                            RÉCENT
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Section informative */}
            <section className="py-12 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Comment consulter vos résultats
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl font-bold text-blue-600">1</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Choisissez votre examen
                            </h3>
                            <p className="text-gray-600">
                                Cliquez sur l'examen correspondant à votre session
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl font-bold text-green-600">2</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Recherchez votre nom
                            </h3>
                            <p className="text-gray-600">
                                Utilisez la recherche pour trouver votre résultat rapidement
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl font-bold text-purple-600">3</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Consultez vos détails
                            </h3>
                            <p className="text-gray-600">
                                Cliquez sur votre nom pour voir tous les détails
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}