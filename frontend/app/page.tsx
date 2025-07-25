'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    GraduationCap,
    BookOpen,
    Award,
    Calendar,
    Bell,
    Clock,
    AlertCircle,
    CalendarDays,
    Search,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { sessionsApi } from '@/lib/api';
import { Session } from '@/types';
import { formatTauxReussite } from '@/lib/utils';

export default function HomePage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAllSessions, setShowAllSessions] = useState(false);
    const [selectedExamType, setSelectedExamType] = useState<string>('all');

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await sessionsApi.getPublished();
                setSessions(data.sort((a, b) => b.year - a.year));
            } catch (error) {
                console.error('Erreur sessions:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSessions();
    }, []);

    const announcements = [
        {
            id: 1,
            type: 'urgent',
            title: 'Publication des résultats BAC 2024',
            date: '15 Juillet 2024',
            message: 'Les résultats du Baccalauréat session 2024 sont désormais disponibles'
        },
        {
            id: 2,
            type: 'info',
            title: 'Calendrier des examens 2025',
            date: '1er Janvier 2025',
            message: 'Le calendrier officiel des examens 2025 sera publié prochainement'
        },
        {
            id: 3,
            type: 'reminder',
            title: 'Vérification des résultats',
            date: 'Permanent',
            message: 'Utilisez votre NNI pour une recherche plus précise'
        }
    ];

    const getExamIcon = (type: string) => {
        switch (type) {
            case 'bac': return GraduationCap;
            case 'bepc': return BookOpen;
            case 'concours': return Award;
            default: return GraduationCap;
        }
    };

    const getExamLabel = (type: string) => {
        const labels: Record<string, string> = {
            'bac': 'Baccalauréat',
            'bepc': 'BEPC',
            'concours': 'Concours'
        };
        return labels[type] || type.toUpperCase();
    };

    const getAnnouncementIcon = (type: string) => {
        switch (type) {
            case 'urgent': return AlertCircle;     // Publication des résultats - urgent ❗
            case 'info': return CalendarDays;      // Calendrier des examens - calendrier 📅
            case 'reminder': return Search;        // Vérification des résultats - recherche 🔍
            default: return Bell;
        }
    };

    const getAnnouncementColor = (type: string) => {
        switch (type) {
            case 'urgent': return 'border-red-500 bg-red-50 text-red-800';
            case 'info': return 'border-blue-500 bg-blue-50 text-blue-800';
            case 'reminder': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
            default: return 'border-gray-500 bg-gray-50 text-gray-800';
        }
    };

    // Fonction pour obtenir les types d'examens uniques
    const getUniqueExamTypes = () => {
        const types = Array.from(new Set(sessions.map(session => session.exam_type)));
        return types.sort();
    };

    // Fonction pour filtrer les sessions par type
    const getFilteredSessions = () => {
        if (selectedExamType === 'all') {
            return sessions;
        }
        return sessions.filter(session => session.exam_type === selectedExamType);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section - TailAdmin Professional Style */}
            <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIyIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-30"></div>
                
                <div className="relative z-10 container mx-auto px-4 py-16">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-8 border border-white/20">
                            <div className="w-8 h-6">
                                <img src="/Flag_of_Mauritania.svg.png" alt="Drapeau de Mauritanie" className="w-full h-full object-cover rounded-sm" />
                            </div>
                            <span className="text-sm font-medium text-white">République Islamique de Mauritanie</span>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                            Portail des Résultats
                            <span className="block text-3xl md:text-5xl mt-2 text-blue-200">
                                d'Examens Nationaux
                            </span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
                            Consultez vos résultats d'examens en toute sécurité sur la plateforme officielle 
                            du NatijtiMR
                        </p>
                    </div>

                    {/* Announcements Section - Professional Cards */}
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl mb-4">
                                <Bell className="w-4 h-4 text-white" />
                                <span className="text-sm font-medium text-white">Dernières actualités</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white">Actualités et Annonces</h2>
                        </div>
                        
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {announcements.map((announcement) => {
                                const Icon = getAnnouncementIcon(announcement.type);
                                const colors: Record<string, string> = {
                                    urgent: 'from-red-500 to-red-600',
                                    info: 'from-blue-500 to-blue-600', 
                                    reminder: 'from-amber-500 to-amber-600'
                                };
                                return (
                                    <div key={announcement.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`w-12 h-12 bg-gradient-to-r ${colors[announcement.type] || 'from-gray-500 to-gray-600'} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2">
                                                    {announcement.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                                    <Calendar className="w-3 h-3" />
                                                    {announcement.date}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {announcement.message}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Examens Section - TailAdmin Professional Cards */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium mb-6">
                            <GraduationCap className="w-4 h-4" />
                            Examens disponibles
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Choisissez votre examen
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Sélectionnez l'examen correspondant pour accéder à vos résultats en toute sécurité
                        </p>
                    </div>

                    {/* Filtres par type d'examen */}
                    {!isLoading && getUniqueExamTypes().length > 0 && (
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium mb-4">
                                <Award className="w-4 h-4 text-gray-600" />
                                <span className="text-gray-700">Filtrer par type</span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-3">
                                <Button
                                    variant={selectedExamType === 'all' ? 'default' : 'outline'}
                                    onClick={() => setSelectedExamType('all')}
                                    className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
                                        selectedExamType === 'all' 
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                                            : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                                >
                                    Tous les examens
                                </Button>
                                {getUniqueExamTypes().map((examType) => {
                                    const ExamIcon = getExamIcon(examType);
                                    return (
                                        <Button
                                            key={examType}
                                            variant={selectedExamType === examType ? 'default' : 'outline'}
                                            onClick={() => setSelectedExamType(examType)}
                                            className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
                                                selectedExamType === examType 
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                                                    : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                        >
                                            <ExamIcon className="w-4 h-4 mr-2" />
                                            {getExamLabel(examType)}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse bg-gray-100 rounded-3xl p-8 h-80"></div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
                                {(() => {
                                    const filteredSessions = getFilteredSessions();
                                    const sessionsToShow = showAllSessions ? filteredSessions : filteredSessions.slice(0, 6);
                                    return sessionsToShow.map((session) => {
                                const ExamIcon = getExamIcon(session.exam_type);
                                const isRecent = session.year >= new Date().getFullYear();

                                return (
                                    <Link
                                        key={session.id}
                                        href={`/${session.exam_type}-${session.year}-${session.id}`}
                                        className="group"
                                    >
                                        <div className="relative bg-white border border-gray-200 rounded-2xl md:rounded-3xl p-4 md:p-8 hover:border-blue-300 hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                                            {isRecent && (
                                                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-3 py-1.5 rounded-xl font-medium shadow-lg">
                                                    NOUVEAU
                                                </div>
                                            )}

                                            <div className="text-center">
                                                {/* Icon with gradient background */}
                                                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-200">
                                                    <ExamIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                                </div>

                                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                                                    {getExamLabel(session.exam_type)}
                                                </h3>

                                                <p className="text-2xl md:text-3xl font-bold text-blue-600 mb-4 md:mb-6">
                                                    {session.year}
                                                </p>

                                                {/* Statistics cards */}
                                                <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                                                    <div className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-xl">
                                                        <span className="text-xs md:text-sm font-medium text-gray-600">Candidats</span>
                                                        <span className="text-xs md:text-sm font-bold text-gray-900">{session.total_candidates.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-2 md:p-3 bg-green-50 rounded-xl">
                                                        <span className="text-xs md:text-sm font-medium text-gray-600">Admis</span>
                                                        <span className="text-xs md:text-sm font-bold text-green-600">{session.total_passed.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-2 md:p-3 bg-blue-50 rounded-xl">
                                                        <span className="text-xs md:text-sm font-medium text-gray-600">Taux de réussite</span>
                                                        <span className="text-xs md:text-sm font-bold text-blue-600">{formatTauxReussite(session.pass_rate)}</span>
                                                    </div>
                                                </div>

                                                {/* CTA Button */}
                                                <button className="w-full px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base">
                                                    Consulter les résultats
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                );
                                    });
                                })()}
                            </div>

                            {/* Bouton Afficher plus/moins */}
                            {(() => {
                                const filteredSessions = getFilteredSessions();
                                return filteredSessions.length > 6 && (
                                    <div className="text-center mt-8">
                                        <Button
                                            onClick={() => setShowAllSessions(!showAllSessions)}
                                            variant="outline"
                                            className="px-8 py-3 text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 rounded-2xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            {showAllSessions ? (
                                                <>
                                                    <ChevronUp className="w-4 h-4 mr-2" />
                                                    Afficher moins
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-4 h-4 mr-2" />
                                                    Afficher plus ({filteredSessions.length - 6} autres sessions)
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                );
                            })()}
                        </>
                    )}
                </div>
            </section>

            {/* How it works - TailAdmin Style */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium mb-6">
                            <Clock className="w-4 h-4" />
                            Guide d'utilisation
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Comment ça marche ?
                        </h3>
                        <p className="text-lg text-gray-600">
                            Trois étapes simples pour accéder à vos résultats
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            { 
                                number: 1, 
                                title: "Sélectionnez votre examen", 
                                desc: "Choisissez le type d'examen et l'année correspondante",
                                color: "from-blue-500 to-blue-600",
                                icon: GraduationCap
                            },
                            { 
                                number: 2, 
                                title: "Entrez vos informations", 
                                desc: "Utilisez votre NNI, nom complet ou numéro de dossier",
                                color: "from-green-500 to-green-600",
                                icon: BookOpen
                            },
                            { 
                                number: 3, 
                                title: "Consultez vos résultats", 
                                desc: "Accédez à vos résultats détaillés et partagez-les",
                                color: "from-purple-500 to-purple-600",
                                icon: Award
                            }
                        ].map((step, index) => (
                            <div key={step.number} className="relative">
                                {/* Connector line */}
                                {index < 2 && (
                                    <div className="hidden md:block absolute top-20 left-full w-full h-0.5 bg-gray-300 z-0"></div>
                                )}
                                
                                <div className="relative z-10 bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                                    {/* Step number with icon */}
                                    <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                                        <step.icon className="w-8 h-8 text-white" />
                                    </div>
                                    
                                    <div className={`w-8 h-8 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white text-sm font-bold`}>
                                        {step.number}
                                    </div>
                                    
                                    <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
                                    <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}