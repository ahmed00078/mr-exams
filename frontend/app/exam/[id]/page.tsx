'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
    Calendar,
    Target
} from 'lucide-react';
import { sessionsApi, resultsApi, statsApi } from '@/lib/api';
import { Session, ExamResult, SearchParams } from '@/types';
import { formatTauxReussite, formatMoyenne, getDecisionBadgeColor, getExamTypeLabel } from '@/lib/utils';
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

                // Récupérer les statistiques globales et top candidats
                const [statsData, topResults] = await Promise.all([
                    statsApi.getGlobalStats(currentSession.year, currentSession.exam_type),
                    loadTopCandidates(currentSession.year, currentSession.exam_type)
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
    const loadTopCandidates = async (year: number, examType: string): Promise<ExamResult[]> => {
        const searchParams: SearchParams = {
            year: year,
            exam_type: examType,
            page: 1,
            size: 50
        };

        const response = await resultsApi.search(searchParams);

        // Trier par moyenne décroissante et prendre le top 20
        return response.results
            .filter(r => r.moyenne_generale !== null && r.moyenne_generale !== undefined)
            .sort((a, b) => (b.moyenne_generale || 0) - (a.moyenne_generale || 0))
            .slice(0, 20);
    };

    // Recherche de candidats
    const handleSearch = async () => {
        if (!searchTerm.trim() || !session) return;

        setIsSearching(true);
        try {
            const searchParams: SearchParams = {
                nom: searchTerm,
                year: session.year,
                exam_type: session.exam_type,
                page: 1,
                size: 10
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <LoadingSpinner size="large" text="Chargement de l'examen..." />
            </div>
        );
    }

    // Rendu d'erreur
    if (error || !session) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-destructive mb-4">Erreur</h2>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <Button onClick={() => router.push('/')}>
                            Retour à l'accueil
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* En-tête */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.push('/')}
                                className="p-2"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour
                            </Button>

                            <Separator orientation="vertical" className="h-8" />

                            <div className="flex items-center space-x-3">
                                <GraduationCap className="w-8 h-8 text-primary" />
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">
                                        {getExamTypeLabel(session.exam_type)} {session.year}
                                    </h1>
                                    <p className="text-muted-foreground">{session.session_name}</p>
                                </div>
                            </div>
                        </div>

                        {session.publication_date && (
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Publié le</p>
                                <p className="font-medium text-foreground">
                                    {new Date(session.publication_date).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">

                {/* Statistiques principales */}
                {globalStats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">
                                            {globalStats.total_candidats.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Candidats</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <Award className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-600">
                                            {globalStats.total_admis.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Admis</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-primary">
                                            {formatTauxReussite(globalStats.taux_reussite_global)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Taux de réussite</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <MapPin className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {globalStats.wilayas.length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Wilayas</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Section principale - Top candidats */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Trophy className="w-6 h-6 text-yellow-500" />
                                        <div>
                                            <CardTitle>Meilleurs Résultats</CardTitle>
                                            <CardDescription>
                                                Top {topCandidates.length} candidats par moyenne
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {topCandidates.map((candidate, index) => (
                                    <Link
                                        key={candidate.id}
                                        href={`/result/${candidate.id}`}
                                        className="block"
                                    >
                                        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary/20 hover:border-l-primary">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        {/* Position */}
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
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
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-foreground">
                                                                {candidate.nom_complet_fr}
                                                            </h3>
                                                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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

                                                    <div className="text-right">
                                                        {/* Moyenne */}
                                                        <p className="text-2xl font-bold text-primary">
                                                            {formatMoyenne(candidate.moyenne_generale)}
                                                        </p>

                                                        {/* Décision */}
                                                        <Badge
                                                            variant={candidate.decision.toLowerCase().includes('admis') ? 'default' : 'destructive'}
                                                            className="text-xs"
                                                        >
                                                            {candidate.decision}
                                                        </Badge>

                                                        {/* Classements */}
                                                        {candidate.rang_national && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                #{candidate.rang_national} national
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}

                                {topCandidates.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                                        <p>Aucun résultat disponible pour le moment</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Recherche et statistiques */}
                    <div className="space-y-6">
                        {/* Recherche */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Search className="w-5 h-5" />
                                    <span>Rechercher un candidat</span>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="Nom du candidat..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button
                                        onClick={handleSearch}
                                        disabled={isSearching || !searchTerm.trim()}
                                        size="sm"
                                    >
                                        {isSearching ? '...' : <Search className="w-4 h-4" />}
                                    </Button>
                                </div>

                                {/* Résultats de recherche */}
                                {searchResults.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Résultats :</h4>
                                        {searchResults.slice(0, 5).map((result) => (
                                            <Link
                                                key={result.id}
                                                href={`/result/${result.id}`}
                                                className="block"
                                            >
                                                <Card className="hover:shadow-sm transition-shadow">
                                                    <CardContent className="p-3">
                                                        <div className="font-medium text-sm text-foreground">
                                                            {result.nom_complet_fr}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground flex items-center space-x-2">
                                                            <span>{formatMoyenne(result.moyenne_generale)}</span>
                                                            <Separator orientation="vertical" className="h-3" />
                                                            <span>{result.decision}</span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Statistiques par série */}
                        {globalStats && globalStats.series.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Target className="w-5 h-5" />
                                        <span>Par Série</span>
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {globalStats.series
                                        .sort((a, b) => b.taux_reussite - a.taux_reussite)
                                        .slice(0, 5)
                                        .map((serie) => (
                                            <div key={serie.id} className="p-3 bg-muted/50 rounded-lg">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            {serie.name_fr}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {serie.candidats} candidats
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">
                                                        {formatTauxReussite(serie.taux_reussite)}
                                                    </Badge>
                                                </div>

                                                <div className="w-full bg-background rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(serie.taux_reussite, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}