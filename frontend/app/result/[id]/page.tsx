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
    
    // Détecter le type d'examen depuis la session
    const examType = result.session?.exam_type || result.serie?.exam_type;
    // Fallback: si la moyenne > 20, c'est probablement un concours (sur 200)
    const isConcours = examType === 'concours' || (result.moyenne_generale && Number(result.moyenne_generale) > 20);
    const isBepc = examType === 'bepc';
    
    // Debug pour voir la valeur
    console.log('Debug - examType:', examType, 'moyenne:', result.moyenne_generale, 'isConcours:', isConcours);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Barre de navigation moderne */}
            <div className="print:hidden bg-white/70 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour
                        </Button>

                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={handleShare}
                                variant="outline"
                                className="px-3 py-2 text-xs md:text-sm rounded-xl border-slate-300 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                            >
                                <Share2 className="w-4 h-4 mr-1" />
                                Partager
                            </Button>

                            <Button
                                onClick={handlePrint}
                                className="px-3 py-2 text-xs md:text-sm bg-slate-600 hover:bg-slate-700 text-white rounded-xl hidden sm:flex transition-colors"
                            >
                                <Download className="w-4 h-4 mr-1" />
                                Imprimer
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Design moderne minimaliste */}
            <div className="px-4 py-8">
                <div className="max-w-sm mx-auto">

                    {/* Carte principale - Design moderne */}
                    <div className="result-card bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-0 overflow-hidden relative">

                        {/* Bande de couleur en haut */}
                        <div className={`h-2 ${isAdmis ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-rose-400 to-red-500'}`}></div>

                        {/* Contenu principal */}
                        <div className="p-4 space-y-4">

                            {/* Header avec type d'examen */}
                            <div className="text-center">
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 mb-2">
                                    <GraduationCap className="w-3 h-3" />
                                    {getExamTypeLabel(result.serie?.exam_type || '')} {currentYear}
                                </div>
                            </div>

                            {/* Nom du candidat */}
                            <div className="text-center space-y-1">
                                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                                    {result.nom_complet_fr}
                                </h1>
                            </div>

                            {/* Résultat principal - Design moderne */}
                            <div className="text-center space-y-2">
                                {/* Rectangle compact avec résultat */}
                                <div className={`relative px-4 py-3 rounded-xl shadow-md border ${isAdmis
                                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                                        : 'bg-gradient-to-r from-rose-50 to-red-50 border-rose-200'
                                    }`}>

                                    {/* Icône petite en coin */}
                                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${isAdmis ? 'bg-emerald-500' : 'bg-rose-500'
                                        }`}>
                                        {isAdmis ? (
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-white" />
                                        )}
                                    </div>

                                    {/* Contenu compact */}
                                    <div className="text-center">
                                        <div className={`text-lg font-bold mb-1 ${isAdmis ? 'text-emerald-700' : 'text-rose-700'}`}>
                                            {result.decision}
                                        </div>
                                        {/* Affichage conditionnel selon le type d'examen */}
                                        {result.moyenne_generale && (
                                            <div className="flex items-center justify-center gap-1 text-sm">
                                                <span className="text-slate-600">{isConcours ? 'Note:' : 'Moy:'}</span>
                                                <span className="text-xl font-black text-slate-900 bg-white/60 px-2 py-0.5 rounded">
                                                    {isConcours ? Math.round(Number(result.moyenne_generale)) : Number(result.moyenne_generale).toFixed(2)}
                                                </span>
                                                <span className="text-slate-600">/{isConcours ? '200' : '20'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Mention - Seulement pour le BAC */}
                                {result.mention && examType === 'bac' && (
                                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
                                        <Star className="w-3 h-3 text-amber-500" />
                                        <span className="text-xs font-semibold text-amber-700">{result.mention}</span>
                                    </div>
                                )}
                            </div>

                            {/* Identifiants - Design compact */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                        <CreditCard className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="text-xs text-slate-500">NNI</div>
                                    <div className="text-xs font-mono font-bold text-slate-900">
                                        {formatNNI(result.nni)}
                                    </div>
                                </div>

                                {result.numero_dossier && (
                                    <div className="text-center">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                            <Target className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div className="text-xs text-slate-500">N° Dossier</div>
                                        <div className="text-xs font-mono font-bold text-slate-900">
                                            {result.numero_dossier}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Informations et Classements - Design 2 colonnes */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Colonne gauche: Informations */}
                                <div className="space-y-2">
                                    <div className="text-center mb-2">
                                        <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                                            <Building className="w-3 h-3 text-blue-500" />
                                            Informations
                                        </div>
                                    </div>

                                    {/* Établissement */}
                                    {result.etablissement && result.etablissement.name_fr && result.etablissement.name_fr !== result.wilaya?.name_fr && (
                                        <div className="bg-orange-50 rounded-lg p-2 h-12 flex flex-col justify-center">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center">
                                                    <Building className="w-2.5 h-2.5 text-orange-600" />
                                                </div>
                                                <span className="text-xs font-medium text-slate-700">École</span>
                                            </div>
                                            <div className="text-xs font-bold text-orange-600 leading-tight">
                                                {result.etablissement.name_fr}
                                            </div>
                                        </div>
                                    )}

                                    {/* Wilaya */}
                                    {result.wilaya && (
                                        <div className="bg-emerald-50 rounded-lg p-2 h-12 flex flex-col justify-center">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                                                    <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                                                </div>
                                                <span className="text-xs font-medium text-slate-700">Wilaya</span>
                                            </div>
                                            <div className="text-xs font-bold text-emerald-600 leading-tight">
                                                {result.wilaya.name_fr}
                                            </div>
                                        </div>
                                    )}

                                    {/* Série - Masquée pour les concours et BEPC */}
                                    {result.serie && !isConcours && !isBepc && (
                                        <div className="bg-purple-50 rounded-lg p-2 h-12 flex flex-col justify-center">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <GraduationCap className="w-2.5 h-2.5 text-purple-600" />
                                                </div>
                                                <span className="text-xs font-medium text-slate-700">Série</span>
                                            </div>
                                            <div className="text-xs font-bold text-purple-600 leading-tight">
                                                {result.serie.code}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Colonne droite: Classements */}
                                {(result.rang_etablissement || result.rang_wilaya || result.rang_national) && (
                                    <div className="space-y-2">
                                        <div className="text-center mb-2">
                                            <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                                                <Trophy className="w-3 h-3 text-amber-500" />
                                                Classements
                                            </div>
                                        </div>

                                        {result.rang_etablissement && (
                                            <div className="bg-amber-50 rounded-lg p-2 h-12 flex flex-col justify-center">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-4 h-4 bg-amber-100 rounded-full flex items-center justify-center">
                                                        <Medal className="w-2.5 h-2.5 text-amber-600" />
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-700">École</span>
                                                </div>
                                                <div className="text-xs font-bold text-amber-600 leading-tight">
                                                    #{result.rang_etablissement}
                                                </div>
                                            </div>
                                        )}

                                        {result.rang_wilaya && (
                                            <div className="bg-blue-50 rounded-lg p-2 h-12 flex flex-col justify-center">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <Award className="w-2.5 h-2.5 text-blue-600" />
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-700">Wilaya</span>
                                                </div>
                                                <div className="text-xs font-bold text-blue-600 leading-tight">
                                                    #{result.rang_wilaya}
                                                </div>
                                            </div>
                                        )}

                                        {result.rang_national && (
                                            <div className="bg-emerald-50 rounded-lg p-2 h-12 flex flex-col justify-center">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                                                        <Trophy className="w-2.5 h-2.5 text-emerald-600" />
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-700">National</span>
                                                </div>
                                                <div className="text-xs font-bold text-emerald-600 leading-tight">
                                                    #{result.rang_national}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer compact */}
                            <div className="pt-3 border-t border-slate-100 text-center space-y-1">
                                <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>Publié le {formatDate(result.published_at || result.created_at)}</span>
                                </div>
                                <div className="text-xs text-slate-400">
                                    <div>Document officiel • NatijtiMR</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS moderne pour le nouveau design */}
            <style jsx global>{`
                /* Design moderne et fluide */
                .result-card {
                    backdrop-filter: blur(10px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
                
                .result-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                }
                
                /* Optimisations mobile */
                @media screen and (max-width: 480px) {
                    .result-card {
                        margin: 0 8px;
                        border-radius: 24px;
                    }
                }
                
                /* Animations subtiles */
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .result-card {
                    animation: fadeInUp 0.6s ease-out;
                }
                
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
                    
                    .result-card {
                        box-shadow: none !important;
                        backdrop-filter: none !important;
                        background: white !important;
                    }
                }
            `}</style>
        </div>
    );
}