'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
    AlertCircle
} from 'lucide-react';
import { resultsApi } from '@/lib/api';
import { ExamResultDetail } from '@/types';
import {
    formatMoyenne,
    formatNNI,
    formatDate,
    getDecisionBadgeColor,
    getMentionColor
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

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `Résultat ${result?.nom_complet_fr}`,
                text: `${result?.decision} - ${formatMoyenne(result?.moyenne_generale)}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Lien copié dans le presse-papiers');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="large" text="Chargement du résultat..." />
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-800 mb-4">Résultat non trouvé</h2>
                        <p className="text-red-700 mb-6">{error}</p>
                        <button
                            onClick={() => router.back()}
                            className="btn-primary mr-4"
                        >
                            Retour
                        </button>
                        <Link href="/" className="btn-secondary">
                            Accueil
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const isAdmis = result.decision.toLowerCase().includes('admis');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Barre de navigation (masquée à l'impression) */}
            <div className="print:hidden bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Retour</span>
                        </button>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleShare}
                                className="btn-secondary flex items-center space-x-2"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>Partager</span>
                            </button>

                            <button
                                onClick={handlePrint}
                                className="btn-primary flex items-center space-x-2"
                            >
                                <Download className="w-4 h-4" />
                                <span>Imprimer</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu principal - Optimisé pour capture d'écran */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Carte de résultat principale */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">

                    {/* En-tête officiel avec drapeau */}
                    <div className={`${isAdmis ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-red-600 to-red-700'} text-white p-6`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="mauritania-flag w-12 h-9"></div>
                                <div>
                                    <h1 className="text-xl font-bold">République Islamique de Mauritanie</h1>
                                    <p className="text-sm opacity-90">Ministère de l'Éducation Nationale</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold">Résultat Officiel</p>
                                <p className="text-sm opacity-90">
                                    {result.serie?.exam_type?.toUpperCase()} {new Date(result.created_at).getFullYear()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">

                        {/* Section candidat */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                            {/* Informations personnelles */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center space-x-3 mb-6">
                                    <User className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-2xl font-bold text-gray-900">Informations du candidat</h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Nom principal */}
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <label className="block text-sm font-medium text-blue-700 mb-1">
                                            Nom complet
                                        </label>
                                        <p className="text-xl font-bold text-blue-900">
                                            {result.nom_complet_fr}
                                        </p>
                                        {result.nom_complet_ar && (
                                            <p className="text-lg text-blue-800 mt-1" dir="rtl">
                                                {result.nom_complet_ar}
                                            </p>
                                        )}
                                    </div>

                                    {/* Identifiants */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                NNI
                                            </label>
                                            <p className="text-lg font-mono font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded">
                                                {formatNNI(result.nni)}
                                            </p>
                                        </div>

                                        {result.numero_dossier && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                                    N° Dossier
                                                </label>
                                                <p className="text-lg font-mono font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded">
                                                    {result.numero_dossier}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Informations complémentaires */}
                                    {(result.lieu_naissance || result.date_naissance || result.nom_pere) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {result.lieu_naissance && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                                        Lieu de naissance
                                                    </label>
                                                    <p className="text-base text-gray-900">{result.lieu_naissance}</p>
                                                </div>
                                            )}

                                            {result.date_naissance && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                                        Date de naissance
                                                    </label>
                                                    <p className="text-base text-gray-900">
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
                                <div className={`${isAdmis ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} rounded-lg p-6 border-2`}>
                                    <div className="text-center">
                                        {/* Icône de résultat */}
                                        <div className="mb-4">
                                            {isAdmis ? (
                                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                                            ) : (
                                                <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                                            )}
                                        </div>

                                        {/* Décision */}
                                        <div className={`inline-flex items-center px-6 py-3 rounded-full text-xl font-bold mb-4 ${isAdmis ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                                            {result.decision}
                                        </div>

                                        {/* Moyenne */}
                                        {result.moyenne_generale && (
                                            <div className="mb-4">
                                                <p className={`text-4xl font-bold ${isAdmis ? 'text-green-600' : 'text-red-600'} mb-1`}>
                                                    {formatMoyenne(result.moyenne_generale)}
                                                </p>
                                                <p className="text-sm text-gray-600">Moyenne générale</p>
                                            </div>
                                        )}

                                        {/* Mention */}
                                        {result.mention && (
                                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getMentionColor(result.mention)} bg-opacity-10`}>
                                                <Star className="w-4 h-4 mr-1" />
                                                {result.mention}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Informations de l'examen et établissement */}
                        <div className="border-t border-gray-200 pt-8 mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Informations de l'examen</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                {/* Wilaya */}
                                {result.wilaya && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center space-x-3">
                                            <MapPin className="w-6 h-6 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Wilaya</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {result.wilaya.name_fr}
                                                </p>
                                                {result.wilaya.name_ar && (
                                                    <p className="text-sm text-gray-600" dir="rtl">
                                                        {result.wilaya.name_ar}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Établissement */}
                                {result.etablissement && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center space-x-3">
                                            <Building className="w-6 h-6 text-green-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Établissement</p>
                                                <p className="text-base font-semibold text-gray-900 leading-tight">
                                                    {result.etablissement.name_fr}
                                                </p>
                                                {result.etablissement.name_ar && (
                                                    <p className="text-sm text-gray-600" dir="rtl">
                                                        {result.etablissement.name_ar}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Série */}
                                {result.serie && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center space-x-3">
                                            <GraduationCap className="w-6 h-6 text-purple-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Série</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {result.serie.name_fr}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Code: {result.serie.code}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Centre d'examen */}
                            {result.centre_examen && (
                                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                                    <p className="text-sm font-medium text-blue-700 mb-1">Centre d'examen</p>
                                    <p className="text-base font-semibold text-blue-900">{result.centre_examen}</p>
                                </div>
                            )}
                        </div>

                        {/* Classements - Section mise en évidence */}
                        {(result.rang_etablissement || result.rang_wilaya || result.rang_national) && (
                            <div className="border-t border-gray-200 pt-8">
                                <div className="flex items-center space-x-3 mb-6">
                                    <Trophy className="w-6 h-6 text-yellow-500" />
                                    <h3 className="text-xl font-bold text-gray-900">Classements</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                    {result.rang_etablissement && (
                                        <div className="text-center bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                                            <Medal className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                                            <p className="text-3xl font-bold text-yellow-600 mb-2">
                                                #{result.rang_etablissement}
                                            </p>
                                            <p className="text-sm font-medium text-yellow-800">
                                                Classement Établissement
                                            </p>
                                        </div>
                                    )}

                                    {result.rang_wilaya && (
                                        <div className="text-center bg-blue-50 rounded-lg p-6 border border-blue-200">
                                            <Award className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                                            <p className="text-3xl font-bold text-blue-600 mb-2">
                                                #{result.rang_wilaya}
                                            </p>
                                            <p className="text-sm font-medium text-blue-800">
                                                Classement Wilaya
                                            </p>
                                        </div>
                                    )}

                                    {result.rang_national && (
                                        <div className="text-center bg-green-50 rounded-lg p-6 border border-green-200">
                                            <Trophy className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                            <p className="text-3xl font-bold text-green-600 mb-2">
                                                #{result.rang_national}
                                            </p>
                                            <p className="text-sm font-medium text-green-800">
                                                Classement National
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Footer avec date et authenticité */}
                        <div className="border-t border-gray-200 pt-6 mt-8 text-center">
                            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        Publié le {formatDate(result.published_at || result.created_at)}
                                    </span>
                                </div>
                                <span>•</span>
                                <span className="font-medium">Document officiel certifié</span>
                                <span>•</span>
                                <span>Portail des résultats d'examens mauritaniens</span>
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