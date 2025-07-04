'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    User,
    MapPin,
    Building,
    GraduationCap,
    Calendar,
    Trophy,
    CheckCircle,
    AlertCircle,
    Search
} from 'lucide-react';
import { resultsApi, sessionsApi } from '@/lib/api';
import { ExamResult, Session } from '@/types';
import { formatMoyenne, formatNNI, formatDate, getExamTypeLabel } from '@/lib/utils';

export default function NumeroSearchPage() {
    const params = useParams();
    const router = useRouter();

    const examParam = params.exam as string; // ex: "bac-2024"
    const nni = params.nni as string;

    // Parser le paramètre d'examen
    const [examType, year] = examParam.split('-');
    const numericYear = parseInt(year);

    // États
    const [result, setResult] = useState<ExamResult | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const searchResult = async () => {
            try {
                // Chercher d'abord la session
                const sessionsData = await sessionsApi.getPublished(examType, numericYear);
                const currentSession = sessionsData.find(s =>
                    s.exam_type === examType && s.year === numericYear
                );

                if (!currentSession) {
                    router.push('/');
                    return;
                }

                setSession(currentSession);

                // Rechercher le résultat par NNI
                const searchResponse = await resultsApi.search({
                    nni: nni,
                    year: numericYear,
                    exam_type: examType,
                    page: 1,
                    size: 1
                });

                if (searchResponse.results.length > 0) {
                    setResult(searchResponse.results[0]);
                } else {
                    setNotFound(true);
                }

            } catch (error) {
                console.error('Erreur recherche:', error);
                setNotFound(true);
            } finally {
                setIsLoading(false);
            }
        };

        if (nni && examType && numericYear) {
            searchResult();
        }
    }, [nni, examType, numericYear, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Recherche en cours...</p>
                </div>
            </div>
        );
    }

    const isAdmis = result?.decision.toLowerCase().includes('admis');

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
                            <Search className="w-4 h-4" />
                            <span>NNI: {formatNNI(nni)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {notFound ? (
                    // Résultat non trouvé
                    <Card className="text-center py-12">
                        <CardContent>
                            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-destructive mb-4">
                                Aucun résultat trouvé
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                Le NNI <strong>{formatNNI(nni)}</strong> ne correspond à aucun candidat
                                pour le {getExamTypeLabel(examType)} {year}.
                            </p>
                            <div className="space-x-4">
                                <Button onClick={() => router.push(`/${examParam}`)}>
                                    Nouvelle recherche
                                </Button>
                                <Button variant="outline" onClick={() => router.push('/')}>
                                    Changer d'examen
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : result ? (
                    // Résultat trouvé
                    <div className="space-y-6">
                        {/* Carte principale du résultat */}
                        <Card className="overflow-hidden">
                            {/* En-tête coloré selon le résultat */}
                            <div className={`p-6 text-white ${isAdmis
                                    ? 'bg-gradient-to-r from-green-600 to-green-700'
                                    : 'bg-gradient-to-r from-red-600 to-red-700'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="mauritania-flag w-12 h-9 rounded"></div>
                                        <div>
                                            <h1 className="text-xl font-bold">République Islamique de Mauritanie</h1>
                                            <p className="opacity-90">Ministère de l'Éducation Nationale</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold">Résultat Officiel</p>
                                        <p className="opacity-90">{getExamTypeLabel(examType)} {year}</p>
                                    </div>
                                </div>
                            </div>

                            <CardContent className="p-8">
                                {/* Informations du candidat */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2">
                                        {/* Nom et informations principales */}
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                                {result.nom_complet_fr}
                                            </h2>
                                            {result.nom_complet_ar && (
                                                <p className="text-lg text-muted-foreground" dir="rtl">
                                                    {result.nom_complet_ar}
                                                </p>
                                            )}
                                            <p className="text-sm text-muted-foreground mt-2">
                                                NNI: {formatNNI(result.nni)}
                                                {result.numero_dossier && ` • Dossier: ${result.numero_dossier}`}
                                            </p>
                                        </div>

                                        {/* Détails de l'examen */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {result.wilaya && (
                                                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                                                    <MapPin className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Wilaya</p>
                                                        <p className="font-medium">{result.wilaya.name_fr}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {result.etablissement && (
                                                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                                                    <Building className="w-5 h-5 text-green-600" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Établissement</p>
                                                        <p className="font-medium text-sm leading-tight">
                                                            {result.etablissement.name_fr}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {result.serie && (
                                                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                                                    <GraduationCap className="w-5 h-5 text-purple-600" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Série</p>
                                                        <p className="font-medium">{result.serie.name_fr}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                                                <Calendar className="w-5 h-5 text-orange-600" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Publié le</p>
                                                    <p className="font-medium">{formatDate(result.created_at)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Résultat principal */}
                                    <div className="lg:col-span-1">
                                        <Card className={`text-center ${isAdmis ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                            }`}>
                                            <CardContent className="p-6">
                                                <div className="mb-4">
                                                    {isAdmis ? (
                                                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                                                    ) : (
                                                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                                                    )}
                                                </div>

                                                <Badge
                                                    variant={isAdmis ? "default" : "destructive"}
                                                    className="text-xl font-bold px-6 py-3 mb-4"
                                                >
                                                    {result.decision}
                                                </Badge>

                                                {result.moyenne_generale && (
                                                    <div className="mb-4">
                                                        <p className={`text-4xl font-bold mb-1 ${isAdmis ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                            {formatMoyenne(result.moyenne_generale)}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">Moyenne générale</p>
                                                    </div>
                                                )}

                                                {result.mention && (
                                                    <Badge variant="outline" className="text-sm">
                                                        {result.mention}
                                                    </Badge>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                {/* Classements */}
                                {(result.rang_etablissement || result.rang_wilaya || result.rang_national) && (
                                    <div className="mt-8 pt-8 border-t">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <Trophy className="w-6 h-6 text-yellow-500" />
                                            <h3 className="text-xl font-bold">Classements</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {result.rang_etablissement && (
                                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                                    <p className="text-2xl font-bold text-yellow-600">
                                                        #{result.rang_etablissement}
                                                    </p>
                                                    <p className="text-sm text-yellow-800 font-medium">Établissement</p>
                                                </div>
                                            )}

                                            {result.rang_wilaya && (
                                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        #{result.rang_wilaya}
                                                    </p>
                                                    <p className="text-sm text-blue-800 font-medium">Wilaya</p>
                                                </div>
                                            )}

                                            {result.rang_national && (
                                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                                    <p className="text-2xl font-bold text-green-600">
                                                        #{result.rang_national}
                                                    </p>
                                                    <p className="text-sm text-green-800 font-medium">National</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button onClick={() => window.print()}>
                                        Imprimer le résultat
                                    </Button>
                                    <Button variant="outline" onClick={() => router.push(`/${examParam}`)}>
                                        Nouvelle recherche
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : null}
            </div>
        </div>
    );
}