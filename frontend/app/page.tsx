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
    AlertCircle
} from 'lucide-react';
import { sessionsApi } from '@/lib/api';
import { Session } from '@/types';
import { formatTauxReussite } from '@/lib/utils';

export default function HomePage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
        const labels = {
            'bac': 'Baccalauréat',
            'bepc': 'BEPC',
            'concours': 'Concours'
        };
        return labels[type] || type.toUpperCase();
    };

    const getAnnouncementIcon = (type: string) => {
        switch (type) {
            case 'urgent': return AlertCircle;
            case 'info': return Bell;
            case 'reminder': return Clock;
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

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section - Modern Angular Design */}
            <section className="relative overflow-hidden">
                {/* Background with geometric shapes */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/10 rounded-full blur-2xl"></div>
                </div>

                {/* Geometric shapes */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/30 transform rotate-45 rounded-lg"></div>
                    <div className="absolute top-40 right-20 w-16 h-16 bg-purple-500/30 transform rotate-12 rounded-lg"></div>
                    <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-yellow-500/30 transform rotate-45 rounded-lg"></div>
                </div>

                <div className="relative z-10 container mx-auto px-4 py-20">
                    <div className="max-w-4xl mx-auto text-center text-white">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8">
                            <div className="text-2xl">🇲🇷</div>
                            <span className="text-sm font-medium">Plateforme Officielle</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            Résultats
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                d' Examens
                            </span>
                        </h1>
                        
                        <p className="text-xl md:text-2xl mb-8 text-slate-300 font-light">
                            La plateforme moderne et sécurisée pour consulter vos résultats
                        </p>

                    </div>

                    {/* Actualités intégrées dans le hero */}
                    <div className="max-w-4xl mx-auto mt-16">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <Bell className="w-5 h-5 text-white" />
                            <h2 className="text-xl font-semibold text-white">Actualités et Annonces</h2>
                        </div>
                        
                        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {announcements.map((announcement) => {
                                const Icon = getAnnouncementIcon(announcement.type);
                                return (
                                    <Card key={announcement.id} className={`border-2 rounded-lg transition-colors duration-200 hover:shadow-md ${getAnnouncementColor(announcement.type)}`}>
                                        <CardContent className="p-3 sm:p-4">
                                            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                                                <Icon className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold text-xs sm:text-sm leading-tight">
                                                        {announcement.title}
                                                    </h3>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Calendar className="w-3 h-3 flex-shrink-0" />
                                                        <span className="text-xs opacity-75 truncate">
                                                            {announcement.date}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs sm:text-sm leading-relaxed">
                                                {announcement.message}
                                            </p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Examens disponibles - Layout plus simple */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Choisissez votre examen
                    </h2>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="animate-pulse rounded-lg">
                                    <CardContent className="p-8">
                                        <div className="h-24 bg-muted rounded-lg"></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {sessions.map((session) => {
                                const ExamIcon = getExamIcon(session.exam_type);
                                const isRecent = session.year >= new Date().getFullYear();

                                return (
                                    <Link
                                        key={session.id}
                                        href={`/${session.exam_type}-${session.year}-${session.id}`}
                                        className="group"
                                    >
                                        <Card className="h-full rounded-lg hover:shadow-xl transition-colors duration-200 hover:border-slate-300 relative overflow-hidden">
                                            {isRecent && (
                                                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-md">
                                                    NOUVEAU
                                                </div>
                                            )}

                                            <CardContent className="p-8 text-center">
                                                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                                                    <ExamIcon className="w-8 h-8 text-primary" />
                                                </div>

                                                <h3 className="text-xl font-bold mb-2">
                                                    {getExamLabel(session.exam_type)}
                                                </h3>

                                                <p className="text-2xl font-bold text-primary mb-4">
                                                    {session.year}
                                                </p>

                                                <div className="space-y-2 text-sm text-muted-foreground">
                                                    <div className="flex items-center justify-between">
                                                        <span>Candidats:</span>
                                                        <span className="font-medium">{session.total_candidates.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span>Admis:</span>
                                                        <span className="font-medium text-green-600">{session.total_passed.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span>Taux:</span>
                                                        <span className="font-medium text-primary">{formatTauxReussite(session.pass_rate)}</span>
                                                    </div>
                                                </div>

                                                <Button className="w-full mt-4 rounded-lg" variant="outline">
                                                    Consulter les résultats
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Guide rapide - Plus concis */}
            <section className="bg-muted/30 py-12">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-2xl font-bold mb-8">Comment ça marche ?</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-xl font-bold mb-4">
                                1
                            </div>
                            <h4 className="font-semibold mb-2">Choisissez l'examen</h4>
                            <p className="text-sm text-muted-foreground">
                                Cliquez sur l'examen correspondant
                            </p>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center text-xl font-bold mb-4">
                                2
                            </div>
                            <h4 className="font-semibold mb-2">Recherchez</h4>
                            <p className="text-sm text-muted-foreground">
                                Utilisez votre NNI ou nom
                            </p>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center text-xl font-bold mb-4">
                                3
                            </div>
                            <h4 className="font-semibold mb-2">Consultez</h4>
                            <p className="text-sm text-muted-foreground">
                                Voir tous les détails
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}