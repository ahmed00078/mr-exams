'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ArrowLeft,
    Filter,
    Users,
    GraduationCap,
    Building,
    MapPin,
    X
} from 'lucide-react';
import { resultsApi, referencesApi } from '@/lib/api';
import { ExamResult, Wilaya, Serie, Etablissement } from '@/types';

export default function ResultatsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const examParam = params.exam as string;

    // Parser le paramètre d'examen
    const [examType, year] = examParam.split('-');
    const numericYear = parseInt(year);

    // États
    const [results, setResults] = useState<ExamResult[]>([]);
    const [wilayas, setWilayas] = useState<Wilaya[]>([]);
    const [series, setSeries] = useState<Serie[]>([]);
    const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    // Filtres actuels
    const wilayaFilter = searchParams.get('wilaya');
    const serieFilter = searchParams.get('serie');
    const etablissementFilter = searchParams.get('etablissement');
    
    // Paramètres de recherche directe
    const nniSearch = searchParams.get('nni');
    const numeroDossierSearch = searchParams.get('numero_dossier');
    const nomSearch = searchParams.get('nom');

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);

                // Charger les références
                const [wilayasData, seriesData] = await Promise.all([
                    referencesApi.getWilayas(),
                    referencesApi.getSeries(examType)
                ]);

                setWilayas(wilayasData);
                setSeries(seriesData.filter(s => s.exam_type === examType));

                // Charger les établissements si une wilaya est sélectionnée
                if (wilayaFilter) {
                    const etablissementsData = await referencesApi.getEtablissements(parseInt(wilayaFilter));
                    setEtablissements(etablissementsData);
                }

                // Charger les résultats avec filtres
                await loadResults();

            } catch (error) {
                console.error('Erreur chargement:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [examType, numericYear, wilayaFilter, serieFilter, etablissementFilter, nniSearch, numeroDossierSearch, nomSearch, currentPage]);

    const loadResults = async () => {
        try {
            const searchQuery: any = {
                exam_type: examType,
                year: numericYear,
                page: currentPage,
                size: 20
            };

            // Filtres
            if (wilayaFilter) searchQuery.wilaya_id = parseInt(wilayaFilter);
            if (serieFilter) searchQuery.serie_code = serieFilter;
            if (etablissementFilter) searchQuery.etablissement_id = parseInt(etablissementFilter);
            
            // Recherche directe
            if (nniSearch) searchQuery.nni = nniSearch;
            if (numeroDossierSearch) searchQuery.numero_dossier = numeroDossierSearch;
            if (nomSearch) searchQuery.nom = nomSearch;

            const response = await resultsApi.search(searchQuery);
            setResults(response.results || []);
            setTotalPages(response.total_pages || 1);
            setTotalResults(response.total || 0);
        } catch (error) {
            console.error('Erreur chargement résultats:', error);
            setResults([]);
        }
    };

    const updateFilter = (filterType: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (value && value !== 'all') {
            params.set(filterType, value);
        } else {
            params.delete(filterType);
        }
        
        // Reset page when changing filters
        params.delete('page');
        setCurrentPage(1);

        router.push(`/${examParam}/resultats?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push(`/${examParam}/resultats`);
    };

    const getActiveFiltersCount = () => {
        return [wilayaFilter, serieFilter, etablissementFilter].filter(Boolean).length;
    };

    const getSearchType = () => {
        if (nniSearch) return `Recherche par NNI: ${nniSearch}`;
        if (numeroDossierSearch) return `Recherche par N° Dossier: ${numeroDossierSearch}`;
        if (nomSearch) return `Recherche par nom: ${nomSearch}`;
        return null;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* En-tête */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* <Button
                            variant="ghost"
                            onClick={() => router.push(`/${examParam}`)}
                            className="self-start"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour
                        </Button> */}
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <GraduationCap className="w-6 sm:w-8 h-6 sm:h-8 text-primary flex-shrink-0" />
                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-2xl font-bold truncate">
                                    Résultats {examType.toUpperCase()} {year}
                                </h1>
                                <p className="text-sm sm:text-base text-muted-foreground">
                                    {totalResults.toLocaleString()} résultats trouvés
                                </p>
                                {getSearchType() && (
                                    <p className="text-sm text-blue-600 font-medium">
                                        {getSearchType()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Filtres */}
                <Card className="mb-6">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                Filtres
                            </CardTitle>
                            {getActiveFiltersCount() > 0 && (
                                <Button variant="outline" size="sm" onClick={clearFilters} className="self-start sm:self-auto">
                                    <X className="w-4 h-4 mr-2" />
                                    Effacer ({getActiveFiltersCount()})
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Filtre Wilaya */}
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium">
                                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                    <span>Wilaya</span>
                                </label>
                                <Select
                                    value={wilayaFilter || 'all'}
                                    onValueChange={(value) => updateFilter('wilaya', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Toutes les wilayas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes les wilayas</SelectItem>
                                        {wilayas.map((wilaya) => (
                                            <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                                                {wilaya.name_fr}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filtre Série */}
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium">
                                    <GraduationCap className="w-4 h-4 mr-1 flex-shrink-0" />
                                    <span>Série</span>
                                </label>
                                <Select
                                    value={serieFilter || 'all'}
                                    onValueChange={(value) => updateFilter('serie', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Toutes les séries" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes les séries</SelectItem>
                                        {series.map((serie) => (
                                            <SelectItem key={serie.id} value={serie.code}>
                                                <span className="font-semibold">{serie.code}</span>
                                                <span className="ml-2 text-muted-foreground">- {serie.name_fr}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filtre Établissement */}
                            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                <label className="flex items-center text-sm font-medium">
                                    <Building className="w-4 h-4 mr-1 flex-shrink-0" />
                                    <span>École</span>
                                </label>
                                <Select
                                    value={etablissementFilter || 'all'}
                                    onValueChange={(value) => updateFilter('etablissement', value)}
                                    disabled={!wilayaFilter}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={wilayaFilter ? "Toutes les écoles" : "Sélectionnez une wilaya d'abord"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes les écoles</SelectItem>
                                        {etablissements.map((etab) => (
                                            <SelectItem key={etab.id} value={etab.id.toString()}>
                                                <span className="truncate">{etab.name_fr}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Résultats */}
                <div className="space-y-4">
                    {results.map((result) => (
                        <Link key={result.id} href={`/result/${result.id}`} className="block">
                            <Card className="hover:shadow-md hover:bg-muted/20 transition-all cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-lg truncate">
                                                        {result.nom_complet_fr}
                                                    </h3>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground mt-1">
                                                        <span className="font-mono">NNI: {result.nni}</span>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span className="truncate">{result.wilaya?.name_fr || 'Wilaya non spécifiée'}</span>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span>Série {result.serie?.code || 'Non spécifiée'}</span>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mt-1 truncate">
                                                        {result.etablissement?.name_fr || 'Établissement non spécifié'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                                            <div className="text-center sm:text-right">
                                                <div className="text-xl sm:text-2xl font-bold text-primary">
                                                    {result.moyenne_generale}/20
                                                </div>
                                                <Badge 
                                                    variant={result.decision === 'Admis' ? 'default' : 'secondary'}
                                                    className={result.decision === 'Admis' ? 'bg-green-100 text-green-800' : ''}
                                                >
                                                    {result.decision}
                                                </Badge>
                                            </div>
                                            
                                            <div className="flex items-center text-muted-foreground">
                                                <ArrowLeft className="w-4 h-4 rotate-180" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-2 sm:px-4"
                            >
                                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Précédent</span>
                            </Button>
                            
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                    return (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(page)}
                                            className="min-w-[36px]"
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}
                            </div>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-2 sm:px-4"
                            >
                                <span className="hidden sm:inline">Suivant</span>
                                <ArrowLeft className="w-4 h-4 rotate-180 sm:ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {results.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Aucun résultat trouvé</h3>
                            <p className="text-muted-foreground">
                                Essayez de modifier vos filtres pour voir plus de résultats.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}