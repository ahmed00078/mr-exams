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
    Filter,
    MapPin,
    Building,
    User,
    Trophy,
    ChevronLeft,
    ChevronRight,
    SortDesc
} from 'lucide-react';
import { resultsApi, referencesApi, sessionsApi } from '@/lib/api';
import { ExamResult, Serie, Wilaya, SearchResponse, Session } from '@/types';
import { formatMoyenne, formatNNI, getExamTypeLabel } from '@/lib/utils';

export default function SeriePage() {
    const params = useParams();
    const router = useRouter();

    const examParam = params.exam as string; // ex: "bac-2024"
    const serieParam = params.serie as string; // ex: "sn" ou "lo"

    // Parser le paramètre d'examen
    const [examType, year] = examParam.split('-');
    const numericYear = parseInt(year);

    // États
    const [serie, setSerie] = useState<Serie | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [wilayas, setWilayas] = useState<Wilaya[]>([]);
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWilaya, setSelectedWilaya] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<'name' | 'moyenne' | 'rang'>('name');
    const [showAdmisOnly, setShowAdmisOnly] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Charger les données initiales
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [sessionsData, seriesData, wilayasData] = await Promise.all([
                    sessionsApi.getPublished(examType, numericYear),
                    referencesApi.getSeries(examType),
                    referencesApi.getWilayas()
                ]);

                // Trouver la session et la série
                const currentSession = sessionsData.find(s =>
                    s.exam_type === examType && s.year === numericYear
                );

                const currentSerie = seriesData.find(s =>
                    s.code.toLowerCase() === serieParam.toLowerCase()
                );

                if (!currentSession || !currentSerie) {
                    router.push(`/${examParam}`);
                    return;
                }

                setSession(currentSession);
                setSerie(currentSerie);
                setWilayas(wilayasData);

            } catch (error) {
                console.error('Erreur chargement initial:', error);
                router.push('/');
            }
        };

        loadInitialData();
    }, [examType, numericYear, serieParam, examParam, router]);

    // Charger les résultats
    useEffect(() => {
        const loadResults = async () => {
            if (!serie) return;

            setIsLoading(true);
            try {
                const searchParams = {
                    year: numericYear,
                    exam_type: examType,
                    serie_id: serie.id,
                    wilaya_id: selectedWilaya || undefined,
                    nom: searchTerm || undefined,
                    decision: showAdmisOnly ? 'Admis' : undefined,
                    page: currentPage,
                    size: 50
                };

                const response = await resultsApi.search(searchParams);

                // Trier les résultats selon le critère choisi
                let sortedResults = [...response.results];
                if (sortBy === 'moyenne') {
                    sortedResults.sort((a, b) => (b.moyenne_generale || 0) - (a.moyenne_generale || 0));
                } else if (sortBy === 'rang') {
                    sortedResults.sort((a, b) => (a.rang_national || 999999) - (b.rang_national || 999999));
                } else {
                    sortedResults.sort((a, b) => a.nom_complet_fr.localeCompare(b.nom_complet_fr));
                }

                setResults({
                    ...response,
                    results: sortedResults
                });

            } catch (error) {
                console.error('Erreur chargement résultats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (serie) {
            loadResults();
        }
    }, [serie, selectedWilaya, searchTerm, currentPage, sortBy, showAdmisOnly, numericYear, examType]);

    const handleSearch = () => {
        setCurrentPage(1);
        // Le useEffect se déclenchera automatiquement
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedWilaya(null);
        setShowAdmisOnly(false);
        setCurrentPage(1);
    };

    if (!serie || !session) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/${examParam}`)}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {getExamTypeLabel(examType)} {year}
                        </Button>

                        <div className="text-muted-foreground">/</div>

                        <div>
                            <h1 className="text-xl font-bold">{serie.name_fr}</h1>
                            <p className="text-sm text-muted-foreground">Code: {serie.code}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Filtres et recherche */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Recherche par nom */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Rechercher
                                </label>
                                <div className="flex">
                                    <Input
                                        placeholder="Nom du candidat..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button
                                        onClick={handleSearch}
                                        size="sm"
                                        className="ml-2"
                                    >
                                        <Search className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Filtre par wilaya */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Wilaya
                                </label>
                                <select
                                    value={selectedWilaya || ''}
                                    onChange={(e) => {
                                        setSelectedWilaya(e.target.value ? Number(e.target.value) : null);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                >
                                    <option value="">Toutes les wilayas</option>
                                    {wilayas.map(wilaya => (
                                        <option key={wilaya.id} value={wilaya.id}>
                                            {wilaya.name_fr}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Trier par */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Trier par
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                >
                                    <option value="name">Nom (A-Z)</option>
                                    <option value="moyenne">Moyenne (décroissant)</option>
                                    <option value="rang">Rang national</option>
                                </select>
                            </div>

                            {/* Options */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Options
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={showAdmisOnly}
                                            onChange={(e) => {
                                                setShowAdmisOnly(e.target.checked);
                                                setCurrentPage(1);
                                            }}
                                            className="rounded border-input"
                                        />
                                        <span>Admis seulement</span>
                                    </label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={resetFilters}
                                        className="w-full"
                                    >
                                        <Filter className="w-4 h-4 mr-2" />
                                        Réinitialiser
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistiques rapides */}
                {results && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold">{results.total}</p>
                                <p className="text-sm text-muted-foreground">
                                    {showAdmisOnly ? 'Candidats admis' : 'Total candidats'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    {results.results.filter(r => r.decision.toLowerCase().includes('admis')).length}
                                </p>
                                <p className="text-sm text-muted-foreground">Admis (page)</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-primary">{results.page}</p>
                                <p className="text-sm text-muted-foreground">Page actuelle</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-purple-600">{results.total_pages}</p>
                                <p className="text-sm text-muted-foreground">Total pages</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Liste des résultats */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Chargement des résultats...</p>
                    </div>
                ) : results && results.results.length > 0 ? (
                    <div className="space-y-4">
                        {results.results.map((result, index) => {
                            const isAdmis = result.decision.toLowerCase().includes('admis');

                            return (
                                <Card key={result.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                            <div className="flex-1 mb-4 lg:mb-0">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-primary">
                                                            {(currentPage - 1) * 50 + index + 1}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg">
                                                            {result.nom_complet_fr}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            NNI: {formatNNI(result.nni)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                                    {result.wilaya && (
                                                        <div className="flex items-center space-x-2">
                                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                                            <span>{result.wilaya.name_fr}</span>
                                                        </div>
                                                    )}

                                                    {result.etablissement && (
                                                        <div className="flex items-center space-x-2">
                                                            <Building className="w-4 h-4 text-muted-foreground" />
                                                            <span className="truncate" title={result.etablissement.name_fr}>
                                                                {result.etablissement.name_fr}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {result.rang_national && (
                                                        <div className="flex items-center space-x-2">
                                                            <Trophy className="w-4 h-4 text-yellow-500" />
                                                            <span>#{result.rang_national} national</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <Badge
                                                    variant={isAdmis ? "default" : "destructive"}
                                                    className="mb-2"
                                                >
                                                    {result.decision}
                                                </Badge>

                                                {result.moyenne_generale && (
                                                    <p className="text-xl font-bold text-primary">
                                                        {formatMoyenne(result.moyenne_generale)}
                                                    </p>
                                                )}

                                                <Link
                                                    href={`/${examParam}/numero/${result.nni}`}
                                                    className="inline-flex items-center text-sm text-primary hover:underline mt-2"
                                                >
                                                    Voir détails
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Aucun résultat trouvé</h3>
                            <p className="text-muted-foreground mb-4">
                                Aucun candidat ne correspond à vos critères de recherche.
                            </p>
                            <Button onClick={resetFilters}>
                                Réinitialiser les filtres
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {results && results.total_pages > 1 && (
                    <Card className="mt-6">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Affichage de {((results.page - 1) * results.size) + 1} à{' '}
                                    {Math.min(results.page * results.size, results.total)} sur{' '}
                                    {results.total} résultats
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={!results.has_prev}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Précédent
                                    </Button>

                                    <span className="px-4 py-2 text-sm font-medium">
                                        Page {results.page} sur {results.total_pages}
                                    </span>

                                    <Button
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        disabled={!results.has_next}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Suivant
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}