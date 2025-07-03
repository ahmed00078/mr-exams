'use client';

import { useState, useEffect } from 'react';
import { Search, Users, BookOpen, Award, TrendingUp } from 'lucide-react';
import SearchForm from '@/components/SearchForm';
import StatsCards from '@/components/StatsCards';
import { sessionsApi } from '@/lib/api';
import { Session } from '@/types';
import { formatTauxReussite } from '@/lib/utils';

export default function HomePage() {
    const [currentSessions, setCurrentSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentSessions = async () => {
            try {
                const sessions = await sessionsApi.getPublished();
                setCurrentSessions(sessions.slice(0, 3)); // Afficher les 3 dernières
            } catch (error) {
                console.error('Erreur lors du chargement des sessions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCurrentSessions();
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="mauritania-flag w-16 h-12"></div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Portail des Résultats d&apos;Examens
                        </h1>

                        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            République Islamique de Mauritanie
                        </p>

                        <p className="text-lg text-blue-200 mb-12 max-w-2xl mx-auto">
                            Consultez vos résultats du BAC, BEPC et autres concours officiels
                            en utilisant votre NNI ou votre nom
                        </p>

                        {/* Statistiques rapides */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-center mb-2">
                                    <Users className="w-8 h-8 text-blue-200" />
                                </div>
                                <p className="text-2xl font-bold text-white">150K+</p>
                                <p className="text-sm text-blue-200">Candidats</p>
                            </div>

                            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-center mb-2">
                                    <BookOpen className="w-8 h-8 text-blue-200" />
                                </div>
                                <p className="text-2xl font-bold text-white">15</p>
                                <p className="text-sm text-blue-200">Wilayas</p>
                            </div>

                            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-center mb-2">
                                    <Award className="w-8 h-8 text-blue-200" />
                                </div>
                                <p className="text-2xl font-bold text-white">85%</p>
                                <p className="text-sm text-blue-200">Taux de réussite</p>
                            </div>

                            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-center mb-2">
                                    <TrendingUp className="w-8 h-8 text-blue-200" />
                                </div>
                                <p className="text-2xl font-bold text-white">+5%</p>
                                <p className="text-sm text-blue-200">vs 2023</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section de recherche */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <Search className="w-16 h-16 text-mauritania-primary mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Rechercher vos résultats
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Utilisez votre Numéro National d&apos;Identification (NNI) ou votre nom
                            pour trouver vos résultats d&apos;examens
                        </p>
                    </div>

                    <div className="card">
                        <SearchForm />
                    </div>
                </div>
            </section>

            {/* Sessions disponibles */}
            {!isLoading && currentSessions.length > 0 && (
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Sessions d&apos;examens disponibles
                            </h2>
                            <p className="text-lg text-gray-600">
                                Consultez les résultats des dernières sessions publiées
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {currentSessions.map((session) => (
                                <div key={session.id} className="card hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {session.exam_type.toUpperCase()} {session.year}
                                            </h3>
                                            <p className="text-gray-600">{session.session_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-mauritania-primary">
                                                {session.pass_rate ? formatTauxReussite(session.pass_rate) : 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-500">Réussite</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Candidats</p>
                                            <p className="font-semibold text-gray-900">
                                                {session.total_candidates.toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Admis</p>
                                            <p className="font-semibold text-green-600">
                                                {session.total_passed.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {session.publication_date && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-sm text-gray-500">
                                                Publié le {new Date(session.publication_date).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Guide d'utilisation */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Comment utiliser le portail
                        </h2>
                        <p className="text-lg text-gray-600">
                            Suivez ces étapes simples pour consulter vos résultats
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-mauritania-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                1. Rechercher
                            </h3>
                            <p className="text-gray-600">
                                Saisissez votre NNI ou votre nom dans le formulaire de recherche ci-dessus
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                2. Consulter
                            </h3>
                            <p className="text-gray-600">
                                Parcourez vos résultats avec toutes les informations détaillées
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                3. Partager
                            </h3>
                            <p className="text-gray-600">
                                Partagez vos résultats avec votre famille et vos amis en toute sécurité
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}