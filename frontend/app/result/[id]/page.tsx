'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Share2,
    Download,
    Trophy,
    MapPin,
    Building,
    GraduationCap,
    Calendar,
    User,
    Award,
    Star,
    Medal,
    CheckCircle,
    AlertCircle,
    CreditCard,
    Target
} from 'lucide-react';
import { resultsApi } from '@/lib/api';
import { ExamResultDetail } from '@/types';
import {
    formatMoyenne,
    formatNNI,
    formatDate,
    getDecisionBadgeColor,
    getMentionColor,
    getExamTypeLabel
} from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function IndividualResultPage() {
    const params = useParams();
    const router = useRouter();
    const resultId = params.id as string;

    const [result, setResult] = useState<ExamResultDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const data = await resultsApi.getById(resultId);
                setResult(data);
            } catch (err) {
                console.error('Erreur lors du chargement du résultat:', err);
                setError('Résultat non trouvé ou non accessible');
            } finally {
                setIsLoading(false);
            }
        };

        if (resultId) {
            fetchResult();
        }
    }, [resultId]);

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Résultat ${result?.nom_complet_fr}`,
                    text: `${result?.decision} - ${formatMoyenne(result?.moyenne_generale)}`,
                    url: window.location.href,
                });
            } catch (err) {
                // Fallback to copy
                fallbackCopy();
            }
        } else {
            fallbackCopy();
        }
    };

    const fallbackCopy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert('Lien copié dans le presse-papiers');
        } catch (err) {
            console.error('Erreur lors de la copie:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <LoadingSpinner size="large" text="Chargement du résultat..." />
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                        <CardTitle className="text-destructive mb-4">Résultat non trouvé</CardTitle>
                        <CardDescription className="mb-6">{error}</CardDescription>
                        <div className="space-x-4">
                            <Button onClick={() => router.back()} variant="outline">
                                Retour
                            </Button>
                            <Button onClick={() => router.push('/')}>
                                Accueil
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isAdmis = result.decision.toLowerCase().includes('admis');
    const currentYear = new Date(result.created_at).getFullYear();

    return (
        <div className="min-h-screen bg-background">
            {/* Barre de navigation (masquée à l'impression) */}
            <div className="print:hidden border-b bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="p-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour
                        </Button>

                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={handleShare}
                                variant="outline"
                                size="sm"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Partager
                            </Button>

                            <Button
                                onClick={handlePrint}
                                size="sm"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Imprimer
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu principal - Optimisé pour capture d'écran */}
            <div className="container mx-auto px-4 py-8 max-w-4xl">

                {/* Carte de résultat principale */}
                <Card className="overflow-hidden">

                    {/* En-tête officiel avec drapeau */}
                    <div className={`${isAdmis ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-red-600 to-red-700'} text-white p-6`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <h1 className="text-xl font-bold">{getExamTypeLabel(result.serie?.exam_type || '')} {currentYear}</h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-8">

                        {/* Section candidat */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                            {/* Informations personnelles */}
                            <div className="lg:col-span-2">
                                <div className="space-y-6">
                                    {/* Nom principal */}
                                    <Card className="bg-primary/5 border-primary/20">
                                        <CardContent className="p-4">
                                            <CardDescription className="text-primary font-medium mb-1">
                                                Nom complet
                                            </CardDescription>
                                            <h3 className="text-2xl font-bold text-primary">
                                                {result.nom_complet_fr}
                                            </h3>
                                            {result.nom_complet_ar && (
                                                <p className="text-lg text-primary/80 mt-1" dir="rtl">
                                                    {result.nom_complet_ar}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Identifiants */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                                                    <CardDescription>NNI</CardDescription>
                                                </div>
                                                <p className="text-lg font-mono font-semibold text-foreground">
                                                    {formatNNI(result.nni)}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {result.numero_dossier && (
                                            <Card>
                                                <CardContent className="p-4">
                                                    <CardDescription className="mb-2">N° Dossier</CardDescription>
                                                    <p className="text-lg font-mono font-semibold text-foreground">
                                                        {result.numero_dossier}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>

                                    {/* Informations complémentaires */}
                                    {(result.lieu_naissance || result.date_naissance) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {result.lieu_naissance && (
                                                <div>
                                                    <CardDescription className="mb-1">Lieu de naissance</CardDescription>
                                                    <p className="font-medium text-foreground">{result.lieu_naissance}</p>
                                                </div>
                                            )}

                                            {result.date_naissance && (
                                                <div>
                                                    <CardDescription className="mb-1">Date de naissance</CardDescription>
                                                    <p className="font-medium text-foreground">
                                                        {formatDate(result.date_naissance)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Résultat principal */}
                            <div className="lg:col-span-1">
                                <Card className={`${isAdmis ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2`}>
                                    <CardContent className="p-6 text-center">
                                        {/* Icône de résultat */}
                                        <div className="mb-4">
                                            {isAdmis ? (
                                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                                            ) : (
                                                <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                                            )}
                                        </div>

                                        {/* Décision */}
                                        <Badge
                                            variant={isAdmis ? "default" : "destructive"}
                                            className="text-xl font-bold px-6 py-3 mb-4"
                                        >
                                            {result.decision}
                                        </Badge>

                                        {/* Moyenne */}
                                        {result.moyenne_generale && (
                                            <div className="mb-4">
                                                <p className={`text-4xl font-bold ${isAdmis ? 'text-green-600' : 'text-red-600'} mb-1`}>
                                                    {formatMoyenne(result.moyenne_generale)}
                                                </p>
                                                <CardDescription>Moyenne générale</CardDescription>
                                            </div>
                                        )}

                                        {/* Mention */}
                                        {result.mention && (
                                            <Badge variant="outline" className="text-sm">
                                                <Star className="w-4 h-4 mr-1" />
                                                {result.mention}
                                            </Badge>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Informations de l'examen et établissement */}
                        <div className="border-t pt-8 mb-8">
                            <h3 className="text-xl font-bold text-foreground mb-6">Informations de l'examen</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                {/* Wilaya */}
                                {result.wilaya && (
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <MapPin className="w-6 h-6 text-blue-600" />
                                                <div>
                                                    <CardDescription>Wilaya</CardDescription>
                                                    <p className="font-semibold text-foreground">
                                                        {result.wilaya.name_fr}
                                                    </p>
                                                    {result.wilaya.name_ar && (
                                                        <p className="text-sm text-muted-foreground" dir="rtl">
                                                            {result.wilaya.name_ar}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Établissement */}
                                {result.etablissement && (
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <Building className="w-6 h-6 text-green-600" />
                                                <div>
                                                    <CardDescription>Établissement</CardDescription>
                                                    <p className="font-semibold text-foreground leading-tight">
                                                        {result.etablissement.name_fr}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Série */}
                                {result.serie && (
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <GraduationCap className="w-6 h-6 text-purple-600" />
                                                <div>
                                                    <CardDescription>Série</CardDescription>
                                                    <p className="font-semibold text-foreground">
                                                        {result.serie.name_fr}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Code: {result.serie.code}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Centre d'examen */}
                            {result.centre_examen && (
                                <Card className="mt-6 bg-blue-50 border-blue-200">
                                    <CardContent className="p-4">
                                        <CardDescription className="text-blue-700 mb-1">Centre d'examen</CardDescription>
                                        <p className="font-semibold text-blue-900">{result.centre_examen}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Classements - Section mise en évidence */}
                        {(result.rang_etablissement || result.rang_wilaya || result.rang_national) && (
                            <div className="border-t pt-8">
                                <div className="flex items-center space-x-3 mb-6">
                                    <Trophy className="w-6 h-6 text-yellow-500" />
                                    <h3 className="text-xl font-bold text-foreground">Classements</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                    {result.rang_etablissement && (
                                        <Card className="text-center bg-yellow-50 border-yellow-200">
                                            <CardContent className="p-6">
                                                <Medal className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                                                <p className="text-3xl font-bold text-yellow-600 mb-2">
                                                    #{result.rang_etablissement}
                                                </p>
                                                <CardDescription className="font-medium text-yellow-800">
                                                    Classement Établissement
                                                </CardDescription>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {result.rang_wilaya && (
                                        <Card className="text-center bg-blue-50 border-blue-200">
                                            <CardContent className="p-6">
                                                <Award className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                                                <p className="text-3xl font-bold text-blue-600 mb-2">
                                                    #{result.rang_wilaya}
                                                </p>
                                                <CardDescription className="font-medium text-blue-800">
                                                    Classement Wilaya
                                                </CardDescription>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {result.rang_national && (
                                        <Card className="text-center bg-green-50 border-green-200">
                                            <CardContent className="p-6">
                                                <Trophy className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                                <p className="text-3xl font-bold text-green-600 mb-2">
                                                    #{result.rang_national}
                                                </p>
                                                <CardDescription className="font-medium text-green-800">
                                                    Classement National
                                                </CardDescription>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Footer avec date et authenticité */}
                        <div className="border-t pt-6 mt-8 text-center">
                            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        Publié le {formatDate(result.published_at || result.created_at)}
                                    </span>
                                </div>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="font-medium">Document officiel certifié</span>
                                <Separator orientation="vertical" className="h-4" />
                                <span>Portail des résultats d'examens mauritaniens</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* CSS pour l'impression */}
            <style jsx global>{`
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    
                    .print\\:hidden {
                        display: none !important;
                    }
                    
                    @page {
                        margin: 0.5in;
                        size: A4;
                    }
                }
            `}</style>
        </div>
    );
}