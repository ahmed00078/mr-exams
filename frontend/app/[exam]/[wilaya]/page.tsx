'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft,
    Search,
    MapPin,
    Building,
    GraduationCap,
    Trophy,
    Users,
    TrendingUp,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { resultsApi, referencesApi, sessionsApi, statsApi } from '@/lib/api';
import { ExamResult, Serie, Wilaya, SearchResponse, Session, Etablissement } from '@/types';
import { formatMoyenne, formatNNI, formatTauxReussite, getExamTypeLabel } from '@/lib/utils';

export default function WilayaPage() {
    const params = useParams();
    const router = useRouter();

    const examParam = params.exam as string; // ex: "bac-2024"
    const wilayaParam = params.wilaya as string; // ex: "assaba"

    // Parser le paramètre d'examen
    const [examType, year] = examParam.split('-');
    const numericYear = parseInt(year);

    // États
    const [wilaya, setWilaya] = useState<Wilaya | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [series, setSeries] = useState<Serie[]>([]);
    const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [wilayaStats, setWilayaStats] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSerie, setSelectedSerie] = useState<number | null>(null);
    const [selectedEtablissement, setSelectedEtablissement] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
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

                // Trouver la session
                const currentSession = sessionsData.find(s =>
                    s.exam_type === examType && s.year === numericYear
                );

                // Trouver la wilaya par nom (converti depuis l'URL)
                const wilayaName = wilayaParam.replace(/-/g, ' ').toLowerCase();
                const currentWilaya = wilayasData.find(w =>
                    w.name_fr.toLowerCase() === wilayaName ||
                    w.name_fr.toLowerCase().includes(wilayaName) ||
                    wilayaName.includes(w.name_fr.toLowerCase())
                );

                if (!currentSession || !currentWilaya) {
                    router.push(`/${examParam}`);
                    return;
                }

                setSession(currentSession);
                setWilaya(currentWilaya);
                setSeries(seriesData.filter(s => s.exam_type === examType));

                // Charger les établissements de cette wilaya
                const etablissementsData = await referencesApi.getEtablissements(currentWilaya.id);
                setEtablissements(etablissementsData);

                // Charger les statistiques de la wilaya
                try {
                    const stats = await statsApi.getWilayaStats(currentWilaya.id, numericYear, examType);
                    setWilayaStats(stats);
                } catch (error) {
                    console.log('Stats wilaya pas disponibles');
                }

            } catch (error) {
                console.error('Erreur chargement initial:', error);
                router.push('/');
            }
        };

        loadInitialData();
    }, [examType, numericYear, wilayaParam, examParam, router]);

    // Charger les résultats
    useEffect(() => {
        const loadResults = async () => {
            if (!wilaya) return;

            setIsLoading(true);
            try {
                const searchParams = {
                    year: numericYear,
                    exam_type: examType,
                    wilaya_id: wilaya.id,
                    serie_id: selectedSerie || undefined,
                    etablissement_id: selectedEtablissement || undefined,
                    nom: searchTerm || undefined,
                    decision: showAdmisOnly ? 'Admis' : undefined,
                    page: currentPage,
                    size: 50
                };

                const response = await resultsApi.search(searchParams);
                setResults(response);

            } catch (error) {
                console.error('Erreur chargement résultats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (wilaya) {
            loadResults();
        }
    }, [wilaya, selectedSerie, selectedEtablissement, searchTerm, currentPage, showAdmisOnly, numericYear, examType]);

    const handleSearch = () => {
        setCurrentPage(1);
    };

    if (!wilaya || !session) {
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

                        <div className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <div>
                                <h1 className="text-xl font-bold">{wilaya.name_fr}</h1>
                                <p className="text-sm text-muted-foreground">{wilaya.name_ar}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Statistiques de la wilaya */}
                {wilayaStats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6 text-center">
                                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold">{wilayaStats.total_candidats}</p>
                                <p className="text-sm text-muted-foreground">Candidats</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 text-center">
                                <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-green-600">{wilayaStats.total_admis}</p>
                                <p className="text-sm text-muted-foreground">Admis</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 text-center">
                                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                                <p className="text-2xl font-bold text-primary">{formatTauxReussite(wilayaStats.taux_reussite)}</p>
                                <p className="text-sm text-muted-foreground">Taux réussite</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 text-center">
                                <GraduationCap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-purple-600">#{wilayaStats.rang_national || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">Rang national</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Tabs defaultValue="resultats" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="resultats">Résultats</TabsTrigger>
                        <TabsTrigger value="etablissements">Établissements</TabsTrigger>
                        <TabsTrigger value="series">Par Série</TabsTrigger>
                    </TabsList>

                    {/* Onglet Résultats */}
                    <TabsContent value="resultats" className="space-y-6">
                        {/* Filtres */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Rechercher</label>
                                        <div className="flex">
                                            <Input
                                                placeholder="Nom du candidat..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            />
                                            <Button onClick={handleSearch} size="sm" className="ml-2">
                                                <Search className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Série</label>
                                        <select
                                            value={selectedSerie || ''}
                                            onChange={(e) => {
                                                setSelectedSerie(e.target.value ? Number(e.target.value) : null);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                        >
                                            <option value="">Toutes les séries</option>
                                            {series.map(serie => (
                                                <option key={serie.id} value={serie.id}>
                                                    {serie.name_fr} ({serie.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Établissement</label>
                                        <select
                                            value={selectedEtablissement || ''}
                                            onChange={(e) => {
                                                setSelectedEtablissement(e.target.value ? Number(e.target.value) : null);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                        >
                                            <option value="">Tous les établissements</option>
                                            {etablissements.map(etab => (
                                                <option key={etab.id} value={etab.id}>
                                                    {etab.name_fr}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Options</label>
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
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Liste des résultats */}
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Chargement...</p>
                            </div>
                        ) : results && results.results.length > 0 ? (
                            <div className="space-y-4">
                                {results.results.map((result, index) => {
                                    const isAdmis = result.decision.toLowerCase().includes('admis');

                                    return (
                                        <Card key={result.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="font-semibold text-lg">{result.nom_complet_fr}</h3>
                                                            <Badge variant={isAdmis ? "default" : "destructive"}>
                                                                {result.decision}
                                                            </Badge>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                                                            <span>NNI: {formatNNI(result.nni)}</span>
                                                            {result.serie && (
                                                                <span>Série: {result.serie.name_fr}</span>
                                                            )}
                                                            {result.etablissement && (
                                                                <span className="truncate">{result.etablissement.name_fr}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="text-right mt-4 lg:mt-0">
                                                        {result.moyenne_generale && (
                                                            <p className="text-xl font-bold text-primary mb-2">
                                                                {formatMoyenne(result.moyenne_generale)}
                                                            </p>
                                                        )}
                                                        <Link
                                                            href={`/${examParam}/numero/${result.nni}`}
                                                            className="text-sm text-primary hover:underline"
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
                                    <h3 className="text-xl font-semibold mb-2">Aucun résultat</h3>
                                    <p className="text-muted-foreground">Aucun candidat trouvé avec ces critères.</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Pagination */}
                        {results && results.total_pages > 1 && (
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Page {results.page} sur {results.total_pages} ({results.total} résultats)
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={!results.has_prev}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => setCurrentPage(prev => prev + 1)}
                                                disabled={!results.has_next}
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
                    </TabsContent>

                    {/* Onglet Établissements */}
                    <TabsContent value="etablissements">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {etablissements.map((etab) => (
                                <Link
                                    key={etab.id}
                                    href={`/${examParam}/wilaya/${wilayaParam}/etablissement/${etab.name_fr.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                    <Card className="hover:shadow-md transition-shadow h-full">
                                        <CardContent className="p-4">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <Building className="w-6 h-6 text-green-600" />
                                                <h3 className="font-semibold text-sm">{etab.name_fr}</h3>
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-2">{etab.type_etablissement}</p>
                                            <p className="text-xs text-muted-foreground">Code: {etab.code}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Onglet Par Série */}
                    <TabsContent value="series">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {series.map((serie) => (
                                <Link
                                    key={serie.id}
                                    href={`/${examParam}/wilaya/${wilayaParam}/serie/${serie.code.toLowerCase()}`}
                                >
                                    <Card className="hover:shadow-md transition-shadow h-full">
                                        <CardContent className="p-4">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <GraduationCap className="w-6 h-6 text-purple-600" />
                                                <h3 className="font-semibold">{serie.name_fr}</h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Code: {serie.code}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}