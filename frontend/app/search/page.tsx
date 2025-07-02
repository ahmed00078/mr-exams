'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Users } from 'lucide-react';
import Link from 'next/link';
import { resultsApi } from '@/lib/api';
import { SearchResponse, ExamResult, SearchParams } from '@/types';
import { getDecisionBadgeColor, formatMoyenne } from '@/lib/utils';
import SearchForm from '@/components/SearchForm';
import ResultCard from '@/components/ResultCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SearchResultsPage() {
    const searchParams = useSearchParams();

    // États
    const [searchData, setSearchData] = useState<SearchResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Construire les paramètres de recherche depuis l'URL
    const getSearchParamsFromUrl = (): SearchParams => {
        return {
            nni: searchParams.get('nni') || undefined,
            numero_dossier: searchParams.get('numero_dossier') || undefined,
            nom: searchParams.get('nom') || undefined,
            wilaya_id: searchParams.get('wilaya_id') ? Number(searchParams.get('wilaya_id')) : undefined,
            etablissement_id: searchParams.get('etablissement_id') ? Number(searchParams.get('etablissement_id')) : undefined,
            serie_id: searchParams.get('serie_id') ? Number(searchParams.get('serie_id')) : undefined,
            decision: searchParams.get('decision') || undefined,
            year: searchParams.get('year') ? Number(searchParams.get('year')) : undefined,
            exam_type: searchParams.get('exam_type') || undefined,
            page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
            size: searchParams.get('size') ? Number(searchParams.get('size')) : 50,
        };
    };

    // Effectuer la recherche
    const performSearch = async (params: SearchParams) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await resultsApi.search(params);
            setSearchData(response);
        } catch (err) {
            console.error('Erreur lors de la recherche:', err);
            setError('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    // Effet pour charger les résultats au montage et quand les paramètres changent
    useEffect(() => {
        const params = getSearchParamsFromUrl();
        if (params.nni || params.nom) {
            performSearch(params);
        } else {
            setIsLoading(false);
            setError('Aucun critère de recherche fourni');
        }
    }, [searchParams]);

    // Gestion de la nouvelle recherche
    const handleNewSearch = (formData: any) => {
        const newParams = { ...formData, page: 1, size: 50 };
        performSearch(newParams);
    };

    // Gestion de la pagination
    const handlePageChange = (newPage: number) => {
        const params = getSearchParamsFromUrl();
        params.page = newPage;
        performSearch(params);
    };

    // Rendu conditionnel pour le chargement
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    // Rendu conditionnel pour les erreurs
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                            <Search className="w-16 h-16 text-red-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-red-800 mb-4">Erreur de recherche</h2>
                            <p className="text-red-700 mb-6">{error}</p>
                            <Link href="/" className="btn-primary">
                                Retourner à l&apos;accueil
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* En-tête avec résumé des résultats */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Résultats de recherche
                            </h1>
                            {searchData && (
                                <p className="text-lg text-gray-600">
                                    {searchData.total === 0
                                        ? 'Aucun résultat trouvé'
                                        : `${searchData.total} résultat${searchData.total > 1 ? 's' : ''} trouvé${searchData.total > 1 ? 's' : ''}`
                                    }
                                </p>
                            )}
                        </div>

                        <div className="mt-4 lg:mt-0 flex space-x-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="btn-secondary flex items-center space-x-2"
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filtres</span>
                            </button>

                            <Link href="/" className="btn-primary flex items-center space-x-2">
                                <Search className="w-4 h-4" />
                                <span>Nouvelle recherche</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Formulaire de recherche (optionnel) */}
                {showFilters && (
                    <div className="card mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Affiner la recherche
                        </h2>
                        <SearchForm
                            initialValues={getSearchParamsFromUrl()}
                            onSearch={handleNewSearch}
                            showAdvanced={true}
                        />
                    </div>
                )}

                {/* Résultats */}
                {searchData && searchData.total > 0 ? (
                    <div className="space-y-6">
                        {/* Statistiques rapides */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <Users className="w-8 h-8 text-blue-500 mr-3" />
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{searchData.total}</p>
                                        <p className="text-sm text-gray-600">Total candidats</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-600">
                                            {searchData.results.filter(r => r.decision.toLowerCase().includes('admis')).length}
                                        </p>
                                        <p className="text-sm text-gray-600">Admis</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-red-600">
                                            {searchData.results.filter(r => r.decision.toLowerCase().includes('ajourné') || r.decision.toLowerCase().includes('ajourne')).length}
                                        </p>
                                        <p className="text-sm text-gray-600">Ajournés</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <Eye className="w-8 h-8 text-purple-500 mr-3" />
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {searchData.page}/{searchData.total_pages}
                                        </p>
                                        <p className="text-sm text-gray-600">Page actuelle</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Liste des résultats */}
                        <div className="space-y-4">
                            {searchData.results.map((result) => (
                                <ResultCard key={result.id} result={result} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {searchData.total_pages > 1 && (
                            <div className="flex items-center justify-between bg-white rounded-lg p-6 border border-gray-200">
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm text-gray-700">
                                        Affichage de {((searchData.page - 1) * searchData.size) + 1} à{' '}
                                        {Math.min(searchData.page * searchData.size, searchData.total)} sur{' '}
                                        {searchData.total} résultats
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handlePageChange(searchData.page - 1)}
                                        disabled={!searchData.has_prev}
                                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                        Page {searchData.page} sur {searchData.total_pages}
                                    </span>

                                    <button
                                        onClick={() => handlePageChange(searchData.page + 1)}
                                        disabled={!searchData.has_next}
                                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Aucun résultat trouvé
                    <div className="text-center py-12">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-2xl mx-auto">
                            <Search className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-yellow-800 mb-4">
                                Aucun résultat trouvé
                            </h2>
                            <p className="text-yellow-700 mb-6">
                                Nous n&apos;avons trouvé aucun résultat correspondant à votre recherche.
                                Vérifiez vos critères de recherche ou essayez avec d&apos;autres informations.
                            </p>
                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowFilters(true)}
                                    className="btn-secondary mr-4"
                                >
                                    Modifier la recherche
                                </button>
                                <Link href="/" className="btn-primary">
                                    Nouvelle recherche
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}