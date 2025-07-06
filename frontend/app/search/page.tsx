'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Eye,
    Users,
    MapPin,
    Building,
    GraduationCap,
    Calendar,
    Target,
    X,
    SlidersHorizontal
} from 'lucide-react';
import { resultsApi, referencesApi } from '@/lib/api';
import { SearchResponse, ExamResult, SearchParams, Wilaya, Etablissement, Serie } from '@/types';
import { getDecisionBadgeColor, formatMoyenne, formatNNI, validateNNI } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SearchResultsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // États principaux
    const [searchData, setSearchData] = useState<SearchResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // États du formulaire de recherche
    const [formData, setFormData] = useState({
        nni: searchParams.get('nni') || '',
        nom: searchParams.get('nom') || '',
        wilaya_id: searchParams.get('wilaya_id') || '',
        etablissement_id: searchParams.get('etablissement_id') || '',
        serie_id: searchParams.get('serie_id') || '',
        year: searchParams.get('year') || new Date().getFullYear().toString(),
        exam_type: searchParams.get('exam_type') || 'bac',
        decision: searchParams.get('decision') || '',
        page: parseInt(searchParams.get('page') || '1'),
        size: parseInt(searchParams.get('size') || '50')
    });

    // États des données de référence
    const [wilayas, setWilayas] = useState<Wilaya[]>([]);
    const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
    const [series, setSeries] = useState<Serie[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Charger les données de référence
    useEffect(() => {
        const loadReferences = async () => {
            try {
                const [wilayasData, seriesData] = await Promise.all([
                    referencesApi.getWilayas(),
                    referencesApi.getSeries()
                ]);
                setWilayas(wilayasData);
                setSeries(seriesData);
            } catch (error) {
                console.error('Erreur lors du chargement des références:', error);
            }
        };
        loadReferences();
    }, []);

    // Charger les établissements quand la wilaya change
    useEffect(() => {
        const loadEtablissements = async () => {
            if (formData.wilaya_id) {
                try {
                    const etablissementsData = await referencesApi.getEtablissements(
                        Number(formData.wilaya_id)
                    );
                    setEtablissements(etablissementsData);
                } catch (error) {
                    console.error('Erreur lors du chargement des établissements:', error);
                }
            } else {
                setEtablissements([]);
                setFormData(prev => ({ ...prev, etablissement_id: '' }));
            }
        };
        loadEtablissements();
    }, [formData.wilaya_id]);

    // Effectuer la recherche initiale
    useEffect(() => {
        const performInitialSearch = async () => {
            if (formData.nni || formData.nom) {
                await performSearch();
            } else {
                setIsLoading(false);
                setError('Aucun critère de recherche fourni');
            }
        };
        performInitialSearch();
    }, []);

    // Construire les paramètres de recherche
    const buildSearchParams = (): SearchParams => {
        return {
            nni: formData.nni || undefined,
            nom: formData.nom || undefined,
            wilaya_id: formData.wilaya_id ? Number(formData.wilaya_id) : undefined,
            etablissement_id: formData.etablissement_id ? Number(formData.etablissement_id) : undefined,
            serie_id: formData.serie_id ? Number(formData.serie_id) : undefined,
            decision: formData.decision || undefined,
            year: Number(formData.year),
            exam_type: formData.exam_type,
            page: formData.page,
            size: formData.size
        };
    };

    // Validation du formulaire
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.nni && !formData.nom) {
            newErrors.general = 'Veuillez saisir au moins votre NNI ou votre nom';
        }

        if (formData.nni && !validateNNI(formData.nni)) {
            newErrors.nni = 'Format de NNI invalide (10 à 20 chiffres)';
        }

        if (formData.nom && formData.nom.length < 2) {
            newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Effectuer la recherche
    const performSearch = async () => {
        if (!validateForm()) return;

        setIsSearching(true);
        setError(null);

        try {
            const params = buildSearchParams();
            const response = await resultsApi.search(params);
            setSearchData(response);
        } catch (err) {
            console.error('Erreur lors de la recherche:', err);
            setError('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
        } finally {
            setIsSearching(false);
            setIsLoading(false);
        }
    };

    // Gestion des changements de formulaire
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Nouvelle recherche
    const handleNewSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setFormData(prev => ({ ...prev, page: 1 }));
        performSearch();
    };

    // Gestion de la pagination
    const handlePageChange = (newPage: number) => {
        setFormData(prev => ({ ...prev, page: newPage }));
        const params = { ...buildSearchParams(), page: newPage };
        
        // Mettre à jour l'URL
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, value.toString());
            }
        });
        
        window.history.pushState({}, '', `?${query.toString()}`);
        performSearch();
    };

    // Réinitialiser le formulaire
    const handleReset = () => {
        setFormData({
            nni: '',
            nom: '',
            wilaya_id: '',
            etablissement_id: '',
            serie_id: '',
            year: new Date().getFullYear().toString(),
            exam_type: 'bac',
            decision: '',
            page: 1,
            size: 50
        });
        setErrors({});
        setSearchData(null);
    };

    // Rendu conditionnel pour le chargement initial
    if (isLoading && !searchData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <LoadingSpinner size="large" text="Recherche en cours..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">

                {/* En-tête avec résumé des résultats */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                Résultats de recherche
                            </h1>
                            {searchData && (
                                <p className="text-lg text-muted-foreground">
                                    {searchData.total === 0
                                        ? 'Aucun résultat trouvé'
                                        : `${searchData.total} résultat${searchData.total > 1 ? 's' : ''} trouvé${searchData.total > 1 ? 's' : ''}`
                                    }
                                </p>
                            )}
                        </div>

                        <div className="mt-4 lg:mt-0 flex space-x-4">
                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                variant="outline"
                            >
                                <SlidersHorizontal className="w-4 h-4 mr-2" />
                                Filtres
                            </Button>

                            <Button onClick={() => router.push('/')}>
                                <Search className="w-4 h-4 mr-2" />
                                Nouvelle recherche
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Formulaire de recherche */}
                <Card className={`mb-8 ${showFilters ? 'block' : 'hidden'}`}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Affiner la recherche</CardTitle>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setShowFilters(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleNewSearch} className="space-y-6">
                            {/* Erreur générale */}
                            {errors.general && (
                                <Card className="bg-destructive/10 border-destructive/20">
                                    <CardContent className="p-4">
                                        <p className="text-destructive text-sm">{errors.general}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Champs de recherche principaux */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="nni" className="block text-sm font-medium text-foreground mb-2">
                                        NNI
                                    </label>
                                    <Input
                                        id="nni"
                                        name="nni"
                                        value={formData.nni}
                                        onChange={handleInputChange}
                                        placeholder="1234567890"
                                        className={errors.nni ? 'border-destructive' : ''}
                                    />
                                    {errors.nni && (
                                        <p className="mt-1 text-sm text-destructive">{errors.nni}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="nom" className="block text-sm font-medium text-foreground mb-2">
                                        Nom du candidat
                                    </label>
                                    <Input
                                        id="nom"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleInputChange}
                                        placeholder="Ahmed Mohamed"
                                        className={errors.nom ? 'border-destructive' : ''}
                                    />
                                    {errors.nom && (
                                        <p className="mt-1 text-sm text-destructive">{errors.nom}</p>
                                    )}
                                </div>
                            </div>

                            {/* Filtres de base */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Année
                                    </label>
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleInputChange}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Type d'examen
                                    </label>
                                    <select
                                        name="exam_type"
                                        value={formData.exam_type}
                                        onChange={handleInputChange}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                    >
                                        <option value="bac">Baccalauréat (BAC)</option>
                                        <option value="bepc">BEPC</option>
                                        <option value="concours">Concours</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Décision
                                    </label>
                                    <select
                                        name="decision"
                                        value={formData.decision}
                                        onChange={handleInputChange}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                    >
                                        <option value="">Toutes les décisions</option>
                                        <option value="Admis">Admis</option>
                                        <option value="Ajourné">Ajourné</option>
                                        <option value="Passable">Passable</option>
                                    </select>
                                </div>
                            </div>

                            {/* Filtres avancés */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Wilaya
                                    </label>
                                    <select
                                        name="wilaya_id"
                                        value={formData.wilaya_id}
                                        onChange={handleInputChange}
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

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Établissement
                                    </label>
                                    <select
                                        name="etablissement_id"
                                        value={formData.etablissement_id}
                                        onChange={handleInputChange}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                        disabled={!formData.wilaya_id}
                                    >
                                        <option value="">Tous les établissements</option>
                                        {etablissements.map(etablissement => (
                                            <option key={etablissement.id} value={etablissement.id}>
                                                {etablissement.name_fr}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Série
                                    </label>
                                    <select
                                        name="serie_id"
                                        value={formData.serie_id}
                                        onChange={handleInputChange}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                    >
                                        <option value="">Toutes les séries</option>
                                        {series
                                            .filter(serie => serie.exam_type === formData.exam_type)
                                            .map(serie => (
                                                <option key={serie.id} value={serie.id}>
                                                    {serie.name_fr} ({serie.code})
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    type="submit"
                                    disabled={isSearching}
                                    className="min-w-[200px]"
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    {isSearching ? 'Recherche...' : 'Rechercher'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleReset}
                                    className="min-w-[200px]"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Réinitialiser
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Message d'erreur */}
                {error && (
                    <Card className="mb-8 bg-destructive/10 border-destructive/20">
                        <CardContent className="p-6 text-center">
                            <h2 className="text-xl font-bold text-destructive mb-4">Erreur de recherche</h2>
                            <p className="text-destructive">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Résultats */}
                {searchData && searchData.total > 0 ? (
                    <div className="space-y-6">
                        {/* Statistiques rapides */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <Users className="w-8 h-8 text-blue-500" />
                                        <div>
                                            <p className="text-2xl font-bold text-foreground">{searchData.total}</p>
                                            <p className="text-sm text-muted-foreground">Total candidats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">
                                                {searchData.results.filter(r => r.decision.toLowerCase().includes('admis')).length}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Admis</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-red-600">
                                                {searchData.results.filter(r => 
                                                    r.decision.toLowerCase().includes('ajourné') || 
                                                    r.decision.toLowerCase().includes('ajourne')
                                                ).length}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Ajournés</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <Eye className="w-8 h-8 text-purple-500" />
                                        <div>
                                            <p className="text-2xl font-bold text-foreground">
                                                {searchData.page}/{searchData.total_pages}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Page actuelle</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Liste des résultats */}
                        <div className="space-y-4">
                            {searchData.results.map((result) => (
                                <Link key={result.id} href={`/result/${result.id}`}>
                                    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                                <div className="flex-1 mb-4 lg:mb-0">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <User className="w-5 h-5 text-muted-foreground" />
                                                        <h3 className="text-xl font-bold text-foreground">
                                                            {result.nom_complet_fr}
                                                        </h3>
                                                    </div>

                                                    {result.nom_complet_ar && (
                                                        <p className="text-lg text-muted-foreground mb-2" dir="rtl">
                                                            {result.nom_complet_ar}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                                                        <span>NNI: {formatNNI(result.nni)}</span>
                                                        {result.numero_dossier && (
                                                            <>
                                                                <Separator orientation="vertical" className="h-4" />
                                                                <span>Dossier: {result.numero_dossier}</span>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {result.wilaya && (
                                                            <div className="flex items-center space-x-2">
                                                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Wilaya</p>
                                                                    <p className="text-sm font-medium">{result.wilaya.name_fr}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {result.etablissement && (
                                                            <div className="flex items-center space-x-2">
                                                                <Building className="w-4 h-4 text-muted-foreground" />
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Établissement</p>
                                                                    <p className="text-sm font-medium truncate">
                                                                        {result.etablissement.name_fr}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {result.serie && (
                                                            <div className="flex items-center space-x-2">
                                                                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Série</p>
                                                                    <p className="text-sm font-medium">
                                                                        {result.serie.name_fr} ({result.serie.code})
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="lg:text-right">
                                                    <Badge 
                                                        variant={result.decision.toLowerCase().includes('admis') ? 'default' : 'destructive'}
                                                        className="mb-2"
                                                    >
                                                        {result.decision}
                                                    </Badge>

                                                    {result.moyenne_generale && (
                                                        <div>
                                                            <p className="text-2xl font-bold text-primary">
                                                                {formatMoyenne(result.moyenne_generale)}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {(result.rang_national || result.rang_wilaya) && (
                                                        <div className="text-xs text-muted-foreground mt-2">
                                                            {result.rang_national && (
                                                                <div>#{result.rang_national} national</div>
                                                            )}
                                                            {result.rang_wilaya && (
                                                                <div>#{result.rang_wilaya} wilaya</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {searchData.total_pages > 1 && (
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Affichage de {((searchData.page - 1) * searchData.size) + 1} à{' '}
                                            {Math.min(searchData.page * searchData.size, searchData.total)} sur{' '}
                                            {searchData.total} résultats
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Button
                                                onClick={() => handlePageChange(searchData.page - 1)}
                                                disabled={!searchData.has_prev}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>

                                            <span className="px-4 py-2 text-sm font-medium">
                                                Page {searchData.page} sur {searchData.total_pages}
                                            </span>

                                            <Button
                                                onClick={() => handlePageChange(searchData.page + 1)}
                                                disabled={!searchData.has_next}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    // Aucun résultat trouvé
                    searchData && (
                        <Card className="max-w-2xl mx-auto">
                            <CardContent className="p-12 text-center">
                                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <CardTitle className="text-2xl mb-4">
                                    Aucun résultat trouvé
                                </CardTitle>
                                <CardDescription className="mb-6">
                                    Nous n'avons trouvé aucun résultat correspondant à votre recherche.
                                    Vérifiez vos critères de recherche ou essayez avec d'autres informations.
                                </CardDescription>
                                <div className="space-x-4">
                                    <Button
                                        onClick={() => setShowFilters(true)}
                                        variant="outline"
                                    >
                                        Modifier la recherche
                                    </Button>
                                    <Button onClick={() => router.push('/')}>
                                        Nouvelle recherche
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                )}
            </div>
        </div>
    );
}