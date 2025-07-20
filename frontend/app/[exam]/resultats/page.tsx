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
                // Les concours et BEPC n'ont pas de séries
                if (examType !== 'concours' && examType !== 'bepc') {
                    setSeries(seriesData.filter(s => s.exam_type === examType));
                }

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
        <div className="min-h-screen bg-gray-50">
            {/* Header - Mobile Optimized */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-3 md:px-4 py-3 md:py-6">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => router.push(`/${examParam}`)}
                                className="px-2 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                <span className="text-sm">Retour</span>
                            </Button>
                            
                            <div className="flex items-center space-x-2 md:space-x-3 flex-1">
                                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center">
                                    <GraduationCap className="w-4 h-4 md:w-6 md:h-6 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-base md:text-2xl font-bold text-gray-900 truncate">
                                        Résultats {examType.toUpperCase()} {year}
                                    </h1>
                                    <p className="text-xs md:text-base text-gray-600">
                                        {totalResults.toLocaleString()} résultats
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {getSearchType() && (
                            <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs md:text-sm font-medium">
                                {getSearchType()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
                {/* Filters Section - Mobile Compact */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-200 p-3 md:p-6 mb-4 md:mb-8">
                    <div className="flex flex-col gap-3 mb-4 md:mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs md:text-sm font-medium mb-2">
                                    <Filter className="w-3 h-3 md:w-4 md:h-4" />
                                    Filtres
                                </div>
                                <h2 className="text-base md:text-xl font-bold text-gray-900">Affiner la recherche</h2>
                            </div>
                            {getActiveFiltersCount() > 0 && (
                                <Button 
                                    variant="outline" 
                                    onClick={clearFilters} 
                                    className="px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors text-xs md:text-sm"
                                >
                                    <X className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                    <span className="hidden sm:inline">Effacer ({getActiveFiltersCount()})</span>
                                    <span className="sm:hidden">Reset</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                        {/* Wilaya Filter */}
                        <div className="space-y-2">
                            <label className="flex items-center text-xs md:text-sm font-semibold text-gray-700">
                                <div className="w-4 h-4 md:w-6 md:h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                                    <MapPin className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                                </div>
                                Wilaya
                            </label>
                            <Select
                                value={wilayaFilter || 'all'}
                                onValueChange={(value) => updateFilter('wilaya', value)}
                            >
                                <SelectTrigger className="w-full h-9 md:h-12 rounded-lg md:rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-xs md:text-sm">
                                    <SelectValue placeholder="Toutes" />
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

                        {/* Serie Filter - Masqué pour les concours et BEPC */}
                        {examType !== 'concours' && examType !== 'bepc' && (
                            <div className="space-y-2">
                                <label className="flex items-center text-xs md:text-sm font-semibold text-gray-700">
                                    <div className="w-4 h-4 md:w-6 md:h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                                        <GraduationCap className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
                                    </div>
                                    Série
                                </label>
                                <Select
                                    value={serieFilter || 'all'}
                                    onValueChange={(value) => updateFilter('serie', value)}
                                >
                                    <SelectTrigger className="w-full h-9 md:h-12 rounded-lg md:rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-xs md:text-sm">
                                        <SelectValue placeholder="Toutes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes les séries</SelectItem>
                                        {series.map((serie) => (
                                            <SelectItem key={serie.id} value={serie.code}>
                                                <span className="font-semibold">{serie.code}</span>
                                                <span className="ml-2 text-gray-500 hidden sm:inline">- {serie.name_fr}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Etablissement Filter */}
                        <div className="space-y-2">
                            <label className="flex items-center text-xs md:text-sm font-semibold text-gray-700">
                                <div className="w-4 h-4 md:w-6 md:h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                                    <Building className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
                                </div>
                                École
                            </label>
                            <Select
                                value={etablissementFilter || 'all'}
                                onValueChange={(value) => updateFilter('etablissement', value)}
                                disabled={!wilayaFilter}
                            >
                                <SelectTrigger className="w-full h-9 md:h-12 rounded-lg md:rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 text-xs md:text-sm">
                                    <SelectValue placeholder={wilayaFilter ? "Toutes" : "Choisir wilaya"} />
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
                </div>

                {/* Results Section - Mobile-First Compact Design */}
                <div className="space-y-2 md:space-y-3">
                    {results.map((result) => (
                        <Link key={result.id} href={`/result/${result.id}`} className="block">
                            <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md hover:scale-[1.005] transition-all duration-200 cursor-pointer group">
                                {/* Mobile: Stack Layout */}
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
                                    {/* Top Row: Name + Score (Mobile) */}
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="font-bold text-sm md:text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate flex-1">
                                            {result.nom_complet_fr}
                                        </h3>
                                        
                                        {/* Score - Always visible on mobile */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <div className="text-right">
                                                <div className="text-base md:text-xl font-bold text-blue-600">
                                                    {examType === 'concours' 
                                                        ? `${result.total_points || 0}/200`
                                                        : `${result.moyenne_generale || 0}/20`
                                                    }
                                                </div>
                                                <div className={`px-2 py-0.5 md:px-3 md:py-1 rounded text-xs font-semibold ${
                                                    result.decision === 'Admis' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {result.decision}
                                                </div>
                                            </div>
                                            <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors rotate-180 hidden md:block" />
                                        </div>
                                    </div>

                                    {/* Bottom Row: Compact Info (Mobile) */}
                                    <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                                        {/* NNI */}
                                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-blue-700">
                                            <span className="font-medium">NNI:</span>
                                            <span className="font-mono">{result.nni}</span>
                                        </div>
                                        
                                        {/* Wilaya */}
                                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded text-green-700">
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate max-w-20 md:max-w-none">{result.wilaya?.name_fr || 'N/A'}</span>
                                        </div>
                                        
                                        {/* Serie - Masquée pour les concours et BEPC */}
                                        {examType !== 'concours' && examType !== 'bepc' && (
                                            <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 rounded text-purple-700">
                                                <GraduationCap className="w-3 h-3" />
                                                <span>{result.serie?.code || 'N/A'}</span>
                                            </div>
                                        )}
                                        
                                        {/* Etablissement - Hidden on very small screens */}
                                        <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-gray-700 flex-1 min-w-0">
                                            <Building className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate text-xs">
                                                {result.etablissement?.name_fr || 'Établissement N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Pagination - Mobile Compact */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-6 md:mt-12">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-2 py-2 rounded-lg border-gray-300 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 text-xs"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                    const page = Math.max(1, Math.min(totalPages - 2, currentPage - 1)) + i;
                                    return (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            onClick={() => setCurrentPage(page)}
                                            className={`min-w-[32px] h-8 md:h-9 rounded-lg text-xs ${
                                                currentPage === page 
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                                    : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}
                                
                                {totalPages > 3 && currentPage < totalPages - 1 && (
                                    <span className="px-2 text-gray-400 text-xs">...</span>
                                )}
                                
                                {totalPages > 3 && currentPage < totalPages && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="min-w-[32px] h-8 md:h-9 rounded-lg text-xs border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                                    >
                                        {totalPages}
                                    </Button>
                                )}
                            </div>
                            
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-2 py-2 rounded-lg border-gray-300 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 text-xs"
                            >
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </Button>
                        </div>
                        
                        {/* Page info for mobile */}
                        <div className="absolute mt-12 text-xs text-gray-500">
                            Page {currentPage} sur {totalPages}
                        </div>
                    </div>
                )}

                {/* No Results - Mobile Optimized */}
                {results.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-12 text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                            <Users className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Aucun résultat trouvé</h3>
                        <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 max-w-md mx-auto">
                            Aucun résultat ne correspond à vos critères. Essayez de modifier vos filtres.
                        </p>
                        <Button 
                            onClick={clearFilters}
                            className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg md:rounded-xl font-semibold transition-colors text-sm md:text-base"
                        >
                            Effacer tous les filtres
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}