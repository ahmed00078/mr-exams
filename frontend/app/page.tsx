'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    GraduationCap,
    Search,
    BookOpen,
    Award,
    Users,
    TrendingUp
} from 'lucide-react';
import { sessionsApi } from '@/lib/api';
import { Session } from '@/types';
import { formatTauxReussite } from '@/lib/utils';

export default function HomePage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
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

    const handleQuickSearch = () => {
        if (searchTerm.trim()) {
            // Recherche directe comme mauribac - si c'est un numéro, chercher par NNI, sinon par nom
            const isNumber = /^\d+$/.test(searchTerm.trim());
            if (isNumber) {
                window.location.href = `/search/numero/${searchTerm}`;
            } else {
                window.location.href = `/search/nom/${encodeURIComponent(searchTerm)}`;
            }
        }
    };

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

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section - Plus simple et direct */}
            <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-20">
                <div className="container mx-auto px-4 text-center">
                    {/* Drapeau mauritanien */}
                    <div className="mauritania-flag w-16 h-12 rounded-md mx-auto mb-6"></div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Résultats d'Examens
                    </h1>
                    <p className="text-xl mb-8 opacity-90">
                        République Islamique de Mauritanie
                    </p>

                    {/* Recherche principale - Plus prominente */}
                    <div className="max-w-lg mx-auto mb-8">
                        <div className="flex gap-3">
                            <Input
                                placeholder="Votre NNI ou nom..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
                                className="bg-background text-foreground text-lg h-12"
                            />
                            <Button
                                onClick={handleQuickSearch}
                                disabled={!searchTerm.trim()}
                                size="lg"
                                className="px-8"
                            >
                                <Search className="w-5 h-5 mr-2" />
                                Rechercher
                            </Button>
                        </div>
                        <p className="text-sm mt-2 opacity-75">
                            Saisissez votre NNI (ex: 1234567890) ou votre nom
                        </p>
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
                                <Card key={i} className="animate-pulse">
                                    <CardContent className="p-8">
                                        <div className="h-24 bg-muted rounded"></div>
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
                                        href={`/${session.exam_type}-${session.year}`}
                                        className="group"
                                    >
                                        <Card className="h-full hover:shadow-xl transition-all duration-300 group-hover:scale-105 relative overflow-hidden">
                                            {isRecent && (
                                                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                    NOUVEAU
                                                </div>
                                            )}

                                            <CardContent className="p-8 text-center">
                                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
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

                                                <Button className="w-full mt-4" variant="outline">
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
                            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4">
                                1
                            </div>
                            <h4 className="font-semibold mb-2">Choisissez l'examen</h4>
                            <p className="text-sm text-muted-foreground">
                                Cliquez sur l'examen correspondant
                            </p>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                                2
                            </div>
                            <h4 className="font-semibold mb-2">Recherchez</h4>
                            <p className="text-sm text-muted-foreground">
                                Utilisez votre NNI ou nom
                            </p>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
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