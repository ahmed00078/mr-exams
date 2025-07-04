'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    GraduationCap,
    Calendar,
    Users,
    Trophy,
    TrendingUp,
    Search,
    BookOpen,
    Award,
    ChevronRight,
    Star
} from 'lucide-react';
import { sessionsApi } from '@/lib/api';
import { Session } from '@/types';
import { formatTauxReussite } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
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

    const getExamBadgeVariant = (type: string) => {
        switch (type) {
            case 'bac': return 'default';
            case 'bepc': return 'secondary';
            case 'concours': return 'outline';
            default: return 'default';
        }
    };

    // Quick search handler
    const handleQuickSearch = () => {
        if (searchTerm.trim()) {
            // Navigate to search with the term
            window.location.href = `/search?nom=${encodeURIComponent(searchTerm)}`;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <LoadingSpinner size="large" text="Chargement des examens..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-6 text-center">
                        <div className="text-destructive text-xl mb-4">{error}</div>
                        <Button onClick={() => window.location.reload()}>
                            Réessayer
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative container mx-auto px-4 py-16">
                    <div className="text-center space-y-6">
                        {/* Flag */}
                        <div className="flex justify-center">
                            <div className="mauritania-flag w-16 h-12 rounded-md"></div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                                Résultats d'Examens
                            </h1>
                            <p className="text-xl text-primary-foreground/90">
                                République Islamique de Mauritanie
                            </p>
                            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                                Consultez les résultats officiels des examens mauritaniens
                            </p>
                        </div>

                        {/* Quick Search */}
                        <div className="max-w-md mx-auto">
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="Rechercher par nom..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
                                    className="bg-background text-foreground"
                                />
                                <Button
                                    onClick={handleQuickSearch}
                                    disabled={!searchTerm.trim()}
                                    variant="secondary"
                                >
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Examens Section */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">
                            Examens Disponibles
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Cliquez sur un examen pour voir les résultats et statistiques
                        </p>
                    </div>

                    {sessions.length === 0 ? (
                        <Card className="max-w-2xl mx-auto">
                            <CardContent className="p-12 text-center">
                                <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <CardTitle className="text-xl mb-2">
                                    Aucun examen disponible
                                </CardTitle>
                                <CardDescription>
                                    Les résultats d'examens seront publiés ici dès qu'ils seront disponibles.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sessions.map((session, index) => {
                                const ExamIcon = getExamTypeIcon(session.exam_type);
                                const isRecent = session.year === new Date().getFullYear();
                                const isTop = index < 3; // Top 3 exams

                                return (
                                    <Link key={session.id} href={`/exam/${session.id}`}>
                                        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden">
                                            {/* Badges */}
                                            <div className="absolute top-4 right-4 flex flex-col gap-1">
                                                {isRecent && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        RÉCENT
                                                    </Badge>
                                                )}
                                                {isTop && (
                                                    <Badge variant="default" className="text-xs">
                                                        <Star className="w-3 h-3 mr-1" />
                                                        TOP
                                                    </Badge>
                                                )}
                                            </div>

                                            <CardHeader className="pb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-3 bg-primary/10 rounded-lg">
                                                        <ExamIcon className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg">
                                                            {getExamTypeLabel(session.exam_type)}
                                                        </CardTitle>
                                                        <CardDescription className="flex items-center space-x-2">
                                                            <span>{session.year}</span>
                                                            <Separator orientation="vertical" className="h-4" />
                                                            <span>{session.session_name}</span>
                                                        </CardDescription>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-4">
                                                {/* Statistiques principales */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                                                        <div className="flex items-center justify-center mb-1">
                                                            <Users className="w-4 h-4 text-muted-foreground" />
                                                        </div>
                                                        <div className="text-xl font-bold text-foreground">
                                                            {session.total_candidates.toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">Candidats</div>
                                                    </div>

                                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                                        <div className="flex items-center justify-center mb-1">
                                                            <Trophy className="w-4 h-4 text-green-600" />
                                                        </div>
                                                        <div className="text-xl font-bold text-green-600">
                                                            {session.total_passed.toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-green-700">Admis</div>
                                                    </div>
                                                </div>

                                                {/* Taux de réussite */}
                                                <div className="text-center p-3 bg-primary/5 rounded-lg">
                                                    <div className="flex items-center justify-center space-x-2 mb-1">
                                                        <TrendingUp className="w-4 h-4 text-primary" />
                                                        <span className="text-lg font-bold text-primary">
                                                            {formatTauxReussite(session.pass_rate)}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">de réussite</div>
                                                </div>

                                                {/* Date de publication */}
                                                {session.publication_date && (
                                                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        <span>
                                                            Publié le {new Date(session.publication_date).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Instructions Section */}
            <section className="py-12 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-foreground mb-8">
                            Comment consulter vos résultats
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-xl font-bold text-primary">1</span>
                                    </div>
                                    <CardTitle className="text-lg mb-2">
                                        Choisissez votre examen
                                    </CardTitle>
                                    <CardDescription>
                                        Cliquez sur l'examen correspondant à votre session
                                    </CardDescription>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-xl font-bold text-green-600">2</span>
                                    </div>
                                    <CardTitle className="text-lg mb-2">
                                        Recherchez votre nom
                                    </CardTitle>
                                    <CardDescription>
                                        Utilisez la recherche pour trouver votre résultat rapidement
                                    </CardDescription>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-xl font-bold text-purple-600">3</span>
                                    </div>
                                    <CardTitle className="text-lg mb-2">
                                        Consultez vos détails
                                    </CardTitle>
                                    <CardDescription>
                                        Cliquez sur votre nom pour voir tous les détails
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}