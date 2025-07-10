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
        <div className="min-h-screen bg-gray-50">
            {/* Header - TailAdmin Style */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.push(`/${examParam}`)}
                                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour
                            </Button>
                            
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                                    <GraduationCap className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Résultats {examType.toUpperCase()} {year}
                                    </h1>
                                    <p className="text-gray-600">
                                        {totalResults.toLocaleString()} résultats trouvés
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {getSearchType() && (
                            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium">
                                {getSearchType()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Filters Section - TailAdmin Style */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium mb-2">
                                <Filter className="w-4 h-4" />
                                Filtres avancés
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Affiner votre recherche</h2>
                        </div>
                        {getActiveFiltersCount() > 0 && (
                            <Button 
                                variant="outline" 
                                onClick={clearFilters} 
                                className="px-4 py-2 rounded-xl border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Effacer les filtres ({getActiveFiltersCount()})
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Wilaya Filter */}
                        <div className="space-y-3">
                            <label className="flex items-center text-sm font-semibold text-gray-700">
                                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                                    <MapPin className="w-4 h-4 text-green-600" />
                                </div>
                                Wilaya
                            </label>
                            <Select
                                value={wilayaFilter || 'all'}
                                onValueChange={(value) => updateFilter('wilaya', value)}
                            >
                                <SelectTrigger className="w-full h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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

                        {/* Serie Filter */}
                        <div className="space-y-3">
                            <label className="flex items-center text-sm font-semibold text-gray-700">
                                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                                    <GraduationCap className="w-4 h-4 text-purple-600" />
                                </div>
                                Série
                            </label>
                            <Select
                                value={serieFilter || 'all'}
                                onValueChange={(value) => updateFilter('serie', value)}
                            >
                                <SelectTrigger className="w-full h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                    <SelectValue placeholder="Toutes les séries" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes les séries</SelectItem>
                                    {series.map((serie) => (
                                        <SelectItem key={serie.id} value={serie.code}>
                                            <span className="font-semibold">{serie.code}</span>
                                            <span className="ml-2 text-gray-500">- {serie.name_fr}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Etablissement Filter */}
                        <div className="space-y-3">
                            <label className="flex items-center text-sm font-semibold text-gray-700">
                                <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                                    <Building className="w-4 h-4 text-orange-600" />
                                </div>
                                École
                            </label>
                            <Select
                                value={etablissementFilter || 'all'}
                                onValueChange={(value) => updateFilter('etablissement', value)}
                                disabled={!wilayaFilter}
                            >
                                <SelectTrigger className="w-full h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50">
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
                </div>

                {/* Results Section - TailAdmin Style with Mobile Optimization */}
                <div className="space-y-3">
                    {results.map((result) => (
                        <Link key={result.id} href={`/result/${result.id}`} className="block">
                            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-3 md:p-4 hover:shadow-md hover:scale-[1.005] transition-all duration-200 cursor-pointer group">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base md:text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-2 truncate">
                                            {result.nom_complet_fr}
                                        </h3>
                                        
                                        {/* Mobile-First Info Layout */}
                                        <div className="space-y-1.5 md:space-y-2">
                                            {/* NNI - Always full width on mobile */}
                                            <div className="flex items-center gap-2 p-1.5 bg-blue-50 rounded-lg text-xs md:text-sm">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                                <span className="font-medium text-gray-700">NNI:</span>
                                                <span className="font-mono text-gray-900 truncate">{result.nni}</span>
                                            </div>
                                            
                                            {/* Wilaya & Serie - Stack on mobile, side by side on larger screens */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs md:text-sm">
                                                <div className="flex items-center gap-2 p-1.5 bg-green-50 rounded-lg">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                                    <span className="font-medium text-gray-700">Wilaya:</span>
                                                    <span className="text-gray-900 truncate">{result.wilaya?.name_fr || 'Non spécifiée'}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 p-1.5 bg-purple-50 rounded-lg">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                                                    <span className="font-medium text-gray-700">Série:</span>
                                                    <span className="text-gray-900">{result.serie?.code || 'Non spécifiée'}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Etablissement - Full width, smaller on mobile */}
                                            <div className="p-1.5 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Building className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                    <span className="text-xs md:text-sm text-gray-700 truncate">
                                                        {result.etablissement?.name_fr || 'Établissement non spécifié'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Score Section - Mobile optimized */}
                                    <div className="flex items-center justify-between md:justify-end gap-4 flex-shrink-0">
                                        <div className="text-center">
                                            <div className="text-xl md:text-2xl font-bold text-blue-600 mb-1">
                                                {result.moyenne_generale}/20
                                            </div>
                                            <div className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-semibold ${
                                                result.decision === 'Admis' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {result.decision}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Pagination - Mobile Responsive */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8 md:mt-12">
                        <div className="flex items-center gap-1 md:gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-2 md:px-4 py-2 rounded-lg md:rounded-xl border-gray-300 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 text-xs md:text-sm"
                            >
                                <ArrowLeft className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Précédent</span>
                            </Button>
                            
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                    return (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            onClick={() => setCurrentPage(page)}
                                            className={`min-w-[36px] md:min-w-[44px] h-9 md:h-11 rounded-lg md:rounded-xl text-xs md:text-sm ${
                                                currentPage === page 
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                                    : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}
                            </div>
                            
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-2 md:px-4 py-2 rounded-lg md:rounded-xl border-gray-300 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 text-xs md:text-sm"
                            >
                                <span className="hidden md:inline">Suivant</span>
                                <ArrowLeft className="w-4 h-4 md:ml-2 rotate-180" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* No Results - TailAdmin Style */}
                {results.length === 0 && (
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Aucun résultat trouvé</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Aucun résultat ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou votre recherche.
                        </p>
                        <Button 
                            onClick={clearFilters}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                        >
                            Effacer tous les filtres
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}