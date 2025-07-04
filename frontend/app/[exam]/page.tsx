'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    Search,
    MapPin,
    Building,
    GraduationCap,
    Users,
    Trophy,
    Calendar,
    Target
} from 'lucide-react';
import { sessionsApi, referencesApi, statsApi } from '@/lib/api';
import { Session, Serie, Wilaya } from '@/types';
import { formatTauxReussite, getExamTypeLabel } from '@/lib/utils';

export default function ExamPage() {
    const params = useParams();
    const router = useRouter();
    const examParam = params.exam as string; // ex: "bac-2024"

    // Parser le paramètre d'examen
    const [examType, year] = examParam.split('-');
    const numericYear = parseInt(year);

    // États
    const [session, setSession] = useState<Session | null>(null);
    const [series, setSeries] = useState<Serie[]>([]);
    const [wilayas, setWilayas] = useState<Wilaya[]>([]);
    const [globalStats, setGlobalStats] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Charger toutes les données en parallèle
                const [sessionsData, seriesData, wilayasData] = await Promise.all([
                    sessionsApi.getPublished(examType, numericYear),
                    referencesApi.getSeries(examType),
                    referencesApi.getWilayas()
                ]);

                // Trouver la session correspondante
                const currentSession = sessionsData.find(s =>
                    s.exam_type === examType && s.year === numericYear
                );

                if (!currentSession) {
                    router.push('/');
                    return;
                }

                setSession(currentSession);
                setSeries(seriesData.filter(s => s.exam_type === examType));
                setWilayas(wilayasData);

                // Charger les statistiques globales
                try {
                    const stats = await statsApi.getGlobalStats(numericYear, examType);
                    setGlobalStats(stats);
                } catch (error) {
                    console.log('Stats not available');
                }

            } catch (error) {
                console.error('Erreur chargement:', error);
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        if (examType && numericYear) {
            loadData();
        }
    }, [examType, numericYear, router]);

    const handleSearch = () => {
        if (searchTerm.trim()) {
            const isNumber = /^\d+$/.test(searchTerm.trim());
            if (isNumber) {
                router.push(`/${examParam}/numero/${searchTerm}`);
            } else {
                router.push(`/${examParam}/nom/${encodeURIComponent(searchTerm)}`);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* En-tête avec retour */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/')}
                            className="p-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Accueil
                        </Button>

                        <div className="flex items-center space-x-3">
                            <GraduationCap className="w-8 h-8 text-primary" />
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {getExamTypeLabel(examType)} {year}
                                </h1>
                                <p className="text-muted-foreground">{session.session_name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Barre de recherche prominente */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="max-w-2xl mx-auto">
                            <h2 className="text-xl font-semibold text-center mb-4">
                                Rechercher un résultat
                            </h2>
                            <div className="flex gap-3">
                                <Input
                                    placeholder="NNI ou nom du candidat..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="text-lg h-12"
                                />
                                <Button
                                    onClick={handleSearch}
                                    disabled={!searchTerm.trim()}
                                    size="lg"
                                    className="px-8"
                                >
                                    <Search className="w-5 h-5 mr-2" />
                                    Rechercher
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistiques globales */}
                {globalStats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6 text-center">
                                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold">{globalStats.total_candidats?.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">Candidats</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 text-center">
                                <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-green-600">{globalStats.total_admis?.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">Admis</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 text-center">
                                <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                                <p className="text-2xl font-bold text-primary">{formatTauxReussite(globalStats.taux_reussite_global)}</p>
                                <p className="text-sm text-muted-foreground">Taux réussite</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 text-center">
                                <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-purple-600">{globalStats.wilayas?.length || 0}</p>
                                <p className="text-sm text-muted-foreground">Wilayas</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Navigation par catégories - Inspirée de mauribac */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Navigation par série */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <GraduationCap className="w-5 h-5" />
                                <span>Par Série</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {series.map((serie) => (
                                <Link
                                    key={serie.id}
                                    href={`/${examParam}/${serie.code.toLowerCase()}`}
                                    className="block"
                                >
                                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                        <div>
                                            <p className="font-medium">{serie.name_fr}</p>
                                            <p className="text-sm text-muted-foreground">Code: {serie.code}</p>
                                        </div>
                                        <Badge variant="outline">{serie.code}</Badge>
                                    </div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Navigation par wilaya */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <MapPin className="w-5 h-5" />
                                <span>Par Wilaya</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                            {wilayas.map((wilaya) => (
                                <Link
                                    key={wilaya.id}
                                    href={`/${examParam}/wilaya/${wilaya.name_fr.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="block"
                                >
                                    <div className="flex items-center justify-between p-2 rounded border hover:bg-muted/50 transition-colors">
                                        <span className="font-medium text-sm">{wilaya.name_fr}</span>
                                        <span className="text-xs text-muted-foreground">{wilaya.code}</span>
                                    </div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Liens rapides supplémentaires */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button asChild variant="outline" className="h-auto p-4">
                        <Link href={`/${examParam}/tous-admis`}>
                            <div className="text-center">
                                <Trophy className="w-6 h-6 mx-auto mb-2" />
                                <p className="font-medium">Tous les admis</p>
                                <p className="text-xs text-muted-foreground">Liste complète</p>
                            </div>
                        </Link>
                    </Button>

                    <Button asChild variant="outline" className="h-auto p-4">
                        <Link href={`/${examParam}/top-resultats`}>
                            <div className="text-center">
                                <Target className="w-6 h-6 mx-auto mb-2" />
                                <p className="font-medium">Top résultats</p>
                                <p className="text-xs text-muted-foreground">Meilleures moyennes</p>
                            </div>
                        </Link>
                    </Button>

                    <Button asChild variant="outline" className="h-auto p-4">
                        <Link href={`/${examParam}/statistiques`}>
                            <div className="text-center">
                                <Building className="w-6 h-6 mx-auto mb-2" />
                                <p className="font-medium">Statistiques</p>
                                <p className="text-xs text-muted-foreground">Détails complets</p>
                            </div>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}