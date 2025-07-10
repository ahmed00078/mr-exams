'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart3,
    TrendingUp,
    Users,
    Award,
    MapPin,
    Building,
    GraduationCap,
    Target,
    Calendar,
    Trophy,
    Star,
    ChevronRight,
    TrendingDown
} from 'lucide-react';
import { statsApi, referencesApi, sessionsApi } from '@/lib/api';
import { Wilaya, Session } from '@/types';
import { formatTauxReussite, getExamTypeLabel } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

interface GlobalStats {
    year: number;
    exam_type: string;
    total_candidats: number;
    total_admis: number;
    taux_reussite_global: number;
    wilayas: WilayaStats[];
    series: SerieStats[];
}

interface WilayaStats {
    id: number;
    name_fr: string;
    name_ar: string;
    candidats: number;
    admis: number;
    taux_reussite: number;
    moyenne?: number;
}

interface SerieStats {
    id: number;
    code: string;
    name_fr: string;
    name_ar: string;
    candidats: number;
    admis: number;
    taux_reussite: number;
}

export default function GlobalStatsPage() {
    // États
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedExamType, setSelectedExamType] = useState<string>('bac');
    const [wilayas, setWilayas] = useState<Wilaya[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les données initiales
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [sessionsData, wilayasData] = await Promise.all([
                    sessionsApi.getPublished(),
                    referencesApi.getWilayas()
                ]);

                setSessions(sessionsData);
                setWilayas(wilayasData);

                // Prendre la session la plus récente par défaut
                if (sessionsData.length > 0) {
                    const latestSession = sessionsData.sort((a, b) => b.year - a.year)[0];
                    setSelectedYear(latestSession.year);
                    setSelectedExamType(latestSession.exam_type);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données initiales:', error);
                setError('Erreur lors du chargement des données');
            }
        };

        loadInitialData();
    }, []);

    // Charger les statistiques globales
    useEffect(() => {
        const loadGlobalStats = async () => {
            if (!selectedYear || !selectedExamType) return;

            setIsLoading(true);
            setError(null);

            try {
                const stats = await statsApi.getGlobalStats(selectedYear, selectedExamType);
                setGlobalStats(stats);
            } catch (error) {
                console.error('Erreur lors du chargement des statistiques:', error);
                setError('Statistiques non disponibles pour cette période');
            } finally {
                setIsLoading(false);
            }
        };

        loadGlobalStats();
    }, [selectedYear, selectedExamType]);

    // Années disponibles
    const availableYears = Array.from(
        new Set(sessions.map(s => s.year))
    ).sort((a, b) => b - a);

    // Types d'examens disponibles
    const availableExamTypes = Array.from(
        new Set(sessions.map(s => s.exam_type))
    );

    const examTypeLabels: Record<string, string> = {
        bac: 'Baccalauréat (BAC)',
        bepc: 'BEPC',
        concours: 'Concours'
    };

    if (isLoading && !globalStats) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <LoadingSpinner size="large" text="Chargement des statistiques..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">

                {/* En-tête */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <BarChart3 className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold text-foreground">Statistiques des examens</h1>
                    </div>
                    <p className="text-lg text-muted-foreground">
                        Découvrez les performances et tendances des examens mauritaniens
                    </p>
                </div>

                {/* Sélecteurs */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Filtres</CardTitle>
                        <CardDescription>
                            Sélectionnez l'année et le type d'examen pour voir les statistiques
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Année */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Année
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                >
                                    {availableYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Type d'examen */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Type d'examen
                                </label>
                                <select
                                    value={selectedExamType}
                                    onChange={(e) => setSelectedExamType(e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                >
                                    {availableExamTypes.map(type => (
                                        <option key={type} value={type}>
                                            {examTypeLabels[type] || type.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <Card className="mb-8 bg-destructive/10 border-destructive/20">
                        <CardContent className="p-6">
                            <p className="text-destructive">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {globalStats && (
                    <>
                        {/* Statistiques globales */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                            <Card>
                                <CardContent className="p-4 md:p-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
                                            <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xl md:text-2xl font-bold text-foreground">
                                                {globalStats.total_candidats.toLocaleString()}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Total candidats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4 md:p-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 md:p-3 bg-green-100 rounded-lg">
                                            <Award className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xl md:text-2xl font-bold text-green-600">
                                                {globalStats.total_admis.toLocaleString()}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Candidats admis</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4 md:p-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 md:p-3 bg-primary/10 rounded-lg">
                                            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xl md:text-2xl font-bold text-primary">
                                                {formatTauxReussite(globalStats.taux_reussite_global)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Taux de réussite</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4 md:p-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 md:p-3 bg-purple-100 rounded-lg">
                                            <MapPin className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xl md:text-2xl font-bold text-purple-600">
                                                {globalStats.wilayas.length}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Wilayas participantes</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Onglets de statistiques détaillées */}
                        <Tabs defaultValue="wilayas" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="wilayas" className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>Par Wilaya</span>
                                </TabsTrigger>
                                <TabsTrigger value="series" className="flex items-center space-x-2">
                                    <GraduationCap className="w-4 h-4" />
                                    <span>Par Série</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Statistiques par wilaya */}
                            <TabsContent value="wilayas">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <MapPin className="w-5 h-5 text-primary" />
                                            <span>Performances par Wilaya</span>
                                        </CardTitle>
                                        <CardDescription>
                                            Classement des wilayas par taux de réussite
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-4">
                                            {globalStats.wilayas
                                                .sort((a, b) => b.taux_reussite - a.taux_reussite)
                                                .map((wilaya, index) => (
                                                    <Card key={wilaya.id} className={`${index < 3 ? 'border-l-4' : ''} ${
                                                        index === 0 ? 'border-l-yellow-500 bg-yellow-50' :
                                                        index === 1 ? 'border-l-gray-400 bg-gray-50' :
                                                        index === 2 ? 'border-l-orange-500 bg-orange-50' : ''
                                                    }`}>
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-4">
                                                                    {/* Position */}
                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                                                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
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

                                                                    {/* Informations wilaya */}
                                                                    <div>
                                                                        <h3 className="font-semibold text-foreground">
                                                                            {wilaya.name_fr}
                                                                        </h3>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {wilaya.candidats.toLocaleString()} candidats
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="text-right">
                                                                    {/* Taux de réussite */}
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className="w-24 bg-muted rounded-full h-2">
                                                                            <div
                                                                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                                                                style={{ width: `${Math.min(wilaya.taux_reussite, 100)}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        <span className="text-lg font-bold text-primary">
                                                                            {formatTauxReussite(wilaya.taux_reussite)}
                                                                        </span>
                                                                    </div>

                                                                    <p className="text-sm text-green-600 font-medium">
                                                                        {wilaya.admis.toLocaleString()} admis
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Statistiques par série */}
                            <TabsContent value="series">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <GraduationCap className="w-5 h-5 text-primary" />
                                            <span>Performances par Série</span>
                                        </CardTitle>
                                        <CardDescription>
                                            Classement des séries par taux de réussite
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                            {globalStats.series
                                                .sort((a, b) => b.taux_reussite - a.taux_reussite)
                                                .map((serie, index) => (
                                                    <Card key={serie.id} className={`${index < 3 ? 'border-2' : ''} ${
                                                        index === 0 ? 'border-yellow-300 bg-yellow-50' :
                                                        index === 1 ? 'border-gray-300 bg-gray-50' :
                                                        index === 2 ? 'border-orange-300 bg-orange-50' : ''
                                                    }`}>
                                                        <CardHeader className="pb-3">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <CardTitle className="text-lg">
                                                                        {serie.name_fr}
                                                                    </CardTitle>
                                                                    <CardDescription>({serie.code})</CardDescription>
                                                                </div>
                                                                {index < 3 && (
                                                                    <Badge variant={
                                                                        index === 0 ? "default" : "secondary"
                                                                    }>
                                                                        #{index + 1}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </CardHeader>

                                                        <CardContent className="space-y-4">
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-muted-foreground">Candidats:</span>
                                                                    <span className="font-medium">{serie.candidats.toLocaleString()}</span>
                                                                </div>

                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-muted-foreground">Admis:</span>
                                                                    <span className="font-medium text-green-600">{serie.admis.toLocaleString()}</span>
                                                                </div>

                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-muted-foreground">Taux de réussite:</span>
                                                                    <span className="font-bold text-primary">
                                                                        {formatTauxReussite(serie.taux_reussite)}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="w-full bg-muted rounded-full h-3">
                                                                <div
                                                                    className="bg-primary h-3 rounded-full transition-all duration-500"
                                                                    style={{ width: `${Math.min(serie.taux_reussite, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Résumé des tendances */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Target className="w-5 h-5 text-primary" />
                                    <span>Résumé des performances</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-3">🏆 Meilleures performances</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                                                <span className="text-sm">Meilleure wilaya:</span>
                                                <span className="font-medium">
                                                    {globalStats.wilayas.sort((a, b) => b.taux_reussite - a.taux_reussite)[0]?.name_fr} 
                                                    ({formatTauxReussite(globalStats.wilayas.sort((a, b) => b.taux_reussite - a.taux_reussite)[0]?.taux_reussite)})
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                                                <span className="text-sm">Meilleure série:</span>
                                                <span className="font-medium">
                                                    {globalStats.series.sort((a, b) => b.taux_reussite - a.taux_reussite)[0]?.name_fr}
                                                    ({formatTauxReussite(globalStats.series.sort((a, b) => b.taux_reussite - a.taux_reussite)[0]?.taux_reussite)})
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-foreground mb-3">📊 Statistiques générales</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <span className="text-sm">Participation moyenne:</span>
                                                <span className="font-medium">
                                                    {Math.round(globalStats.wilayas.reduce((acc, w) => acc + w.candidats, 0) / globalStats.wilayas.length).toLocaleString()} candidats/wilaya
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <span className="text-sm">Taux moyen par série:</span>
                                                <span className="font-medium">
                                                    {formatTauxReussite(globalStats.series.reduce((acc, s) => acc + s.taux_reussite, 0) / globalStats.series.length)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}