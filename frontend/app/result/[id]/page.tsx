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
        <div className="min-h-screen bg-gray-50">
            {/* Barre de navigation - Style TailAdmin */}
            <div className="print:hidden bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-3 py-3">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour
                        </Button>

                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={handleShare}
                                variant="outline"
                                className="px-3 py-2 text-xs md:text-sm rounded-xl border-gray-300 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                            >
                                <Share2 className="w-4 h-4 mr-1" />
                                Partager
                            </Button>

                            <Button
                                onClick={handlePrint}
                                className="px-3 py-2 text-xs md:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl hidden sm:flex transition-colors"
                            >
                                <Download className="w-4 h-4 mr-1" />
                                Imprimer
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu principal - Style TailAdmin */}
            <div className="container mx-auto px-3 py-6 max-w-md md:max-w-4xl">

                {/* Carte de résultat - Style TailAdmin */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-200 overflow-hidden">

                    {/* En-tête officiel - Style TailAdmin */}
                    <div className={`${isAdmis ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white p-4 md:p-6`}>
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl text-sm font-medium mb-2">
                                <GraduationCap className="w-4 h-4" />
                                {getExamTypeLabel(result.serie?.exam_type || '')} {currentYear}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 md:p-8">

                        {/* Section candidat - Layout Mobile-First */}
                        <div className="space-y-4 md:space-y-6">

                            {/* Nom principal - Compact pour mobile */}
                            <div className="text-center">
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                    {result.nom_complet_fr}
                                </h3>
                                {result.nom_complet_ar && (
                                    <p className="text-base md:text-lg text-gray-700 mb-3" dir="rtl">
                                        {result.nom_complet_ar}
                                    </p>
                                )}
                            </div>

                            {/* Résultat principal - Style TailAdmin */}
                            <div className={`${isAdmis ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2 rounded-2xl p-4 text-center shadow-sm`}>
                                {/* Icône et décision */}
                                <div className="flex items-center justify-center gap-3 mb-3">
                                    {isAdmis ? (
                                        <CheckCircle className="w-8 h-8 md:w-12 md:h-12 text-green-500" />
                                    ) : (
                                        <AlertCircle className="w-8 h-8 md:w-12 md:h-12 text-red-500" />
                                    )}
                                    <Badge
                                        variant={isAdmis ? "default" : "destructive"}
                                        className="text-lg md:text-xl font-bold px-4 py-2"
                                    >
                                        {result.decision}
                                    </Badge>
                                </div>

                                {/* Moyenne et mention sur la même ligne */}
                                <div className="flex items-center justify-center gap-4 flex-wrap">
                                    {result.moyenne_generale && (
                                        <div className="text-center">
                                            <p className={`text-2xl md:text-3xl font-bold ${isAdmis ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatMoyenne(result.moyenne_generale)}
                                            </p>
                                            {/* <p className="text-xs md:text-sm text-gray-600">Moyenne</p> */}
                                        </div>
                                    )}
                                    
                                    {result.mention && (
                                        <Badge variant="outline" className="text-sm">
                                            <Star className="w-4 h-4 mr-1" />
                                            {result.mention}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Identifiants - Style TailAdmin */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <CreditCard className="w-3 h-3 text-blue-600" />
                                        <span className="text-xs text-blue-700 font-medium">NNI</span>
                                    </div>
                                    <p className="text-sm md:text-base font-mono font-bold text-blue-900">
                                        {formatNNI(result.nni)}
                                    </p>
                                </div>

                                {result.numero_dossier && (
                                    <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100 hover:shadow-md transition-shadow">
                                        <span className="text-xs text-purple-700 font-medium block mb-1">N° Dossier</span>
                                        <p className="text-sm md:text-base font-mono font-bold text-purple-900">
                                            {result.numero_dossier}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Informations d'examen - Style TailAdmin */}
                            <div className="grid grid-cols-1 gap-3">
                                {/* Wilaya et Série sur la même ligne */}
                                <div className="grid grid-cols-2 gap-3">
                                    {result.wilaya && (
                                        <div className="bg-green-50 rounded-xl p-3 border border-green-100 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-2 mb-1">
                                                <MapPin className="w-3 h-3 text-green-600" />
                                                <span className="text-xs text-green-700 font-medium">Wilaya</span>
                                            </div>
                                            <p className="text-sm font-semibold text-green-900 leading-tight">
                                                {result.wilaya.name_fr}
                                            </p>
                                        </div>
                                    )}

                                    {result.serie && (
                                        <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-2 mb-1">
                                                <GraduationCap className="w-3 h-3 text-purple-600" />
                                                <span className="text-xs text-purple-700 font-medium">Série</span>
                                            </div>
                                            <p className="text-sm font-semibold text-purple-900">
                                                {result.serie.code}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Établissement sur toute la largeur */}
                                {result.etablissement && (
                                    <div className="bg-orange-50 rounded-xl p-3 border border-orange-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Building className="w-3 h-3 text-orange-600" />
                                            <span className="text-xs text-orange-700 font-medium">Établissement</span>
                                        </div>
                                        <p className="text-sm font-semibold text-orange-900 leading-tight">
                                            {result.etablissement.name_fr}
                                        </p>
                                    </div>
                                )}

                                {/* Centre d'examen si disponible */}
                                {result.centre_examen && (
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 hover:shadow-md transition-shadow">
                                        <span className="text-xs text-gray-700 font-medium block mb-1">Centre d'examen</span>
                                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                                            {result.centre_examen}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>


                        {/* Classements - Style TailAdmin */}
                        {(result.rang_etablissement || result.rang_wilaya || result.rang_national) && (
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-yellow-100 rounded-xl flex items-center justify-center">
                                        <Trophy className="w-4 h-4 text-yellow-600" />
                                    </div>
                                    <h3 className="text-base md:text-lg font-bold text-gray-900">Classements</h3>
                                </div>

                                <div className="grid grid-cols-3 gap-2 md:gap-4">
                                    {result.rang_etablissement && (
                                        <div className="text-center bg-yellow-50 border border-yellow-200 rounded-xl p-3 hover:shadow-md transition-shadow">
                                            <Medal className="w-6 h-6 md:w-8 md:h-8 text-yellow-600 mx-auto mb-2" />
                                            <p className="text-lg md:text-2xl font-bold text-yellow-600 mb-1">
                                                #{result.rang_etablissement}
                                            </p>
                                            <p className="text-xs md:text-sm font-medium text-yellow-800">
                                                Établissement
                                            </p>
                                        </div>
                                    )}

                                    {result.rang_wilaya && (
                                        <div className="text-center bg-blue-50 border border-blue-200 rounded-xl p-3 hover:shadow-md transition-shadow">
                                            <Award className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto mb-2" />
                                            <p className="text-lg md:text-2xl font-bold text-blue-600 mb-1">
                                                #{result.rang_wilaya}
                                            </p>
                                            <p className="text-xs md:text-sm font-medium text-blue-800">
                                                Wilaya
                                            </p>
                                        </div>
                                    )}

                                    {result.rang_national && (
                                        <div className="text-center bg-green-50 border border-green-200 rounded-xl p-3 hover:shadow-md transition-shadow">
                                            <Trophy className="w-6 h-6 md:w-8 md:h-8 text-green-600 mx-auto mb-2" />
                                            <p className="text-lg md:text-2xl font-bold text-green-600 mb-1">
                                                #{result.rang_national}
                                            </p>
                                            <p className="text-xs md:text-sm font-medium text-green-800">
                                                National
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Footer - Style TailAdmin */}
                        <div className="border-t border-gray-200 pt-4 mt-6 text-center">
                            <div className="space-y-2">
                                <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-600">
                                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                    <span>Publié le {formatDate(result.published_at || result.created_at)}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center sm:gap-4 text-xs text-gray-500">
                                    <span className="font-medium">Document officiel certifié</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>Portail des résultats d'examens</span>
                                </div>
                                <div className="text-xs text-gray-400">
                                    République Islamique de Mauritanie
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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