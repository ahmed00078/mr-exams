'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Share2,
    Download,
    Eye,
    Calendar,
    MapPin,
    Building,
    GraduationCap,
    Trophy,
    User,
    Copy,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { resultsApi } from '@/lib/api';
import { ExamResultDetail } from '@/types';
import {
    getDecisionBadgeColor,
    formatMoyenne,
    getMentionColor,
    formatNNI,
    formatDate,
    copyToClipboard
} from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import SocialShare from '@/components/SocialShare';

export default function ResultDetailPage() {
    const params = useParams();
    const router = useRouter();
    const resultId = params.id as string;

    // États
    const [result, setResult] = useState<ExamResultDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);

    // Charger les détails du résultat
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

    // Copier le lien
    const handleCopyLink = async () => {
        try {
            await copyToClipboard(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Erreur lors de la copie:', error);
        }
    };

    // Rendu conditionnel pour le chargement
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="large" text="Chargement du résultat..." />
            </div>
        );
    }

    // Rendu conditionnel pour les erreurs
    if (error || !result) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-8">
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Retour aux résultats</span>
                    </button>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            {copied ? (
                                <>
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="text-green-500">Copié!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-5 h-5" />
                                    <span>Copier le lien</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => setShowShareModal(true)}
                            className="btn-secondary flex items-center space-x-2"
                        >
                            <Share2 className="w-4 h-4" />
                            <span>Partager</span>
                        </button>
                    </div>
                </div>

                {/* Carte principale du résultat */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">

                    {/* En-tête officiel */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="mauritania-flag w-12 h-9"></div>
                                <div>
                                    <h1 className="text-xl font-bold">République Islamique de Mauritanie</h1>
                                    <p className="text-blue-100">Ministère de l&apos;Éducation Nationale</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold">Résultat Officiel</p>
                                <p className="text-blue-100 text-sm">Examen 2024</p>
                            </div>
                        </div>
                    </div>

                    {/* Informations du candidat */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Informations personnelles */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center space-x-3 mb-6">
                                    <User className="w-6 h-6 text-mauritania-primary" />
                                    <h2 className="text-2xl font-bold text-gray-900">Informations du candidat</h2>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Nom complet (français)
                                        </label>
                                        <p className="text-lg font-semibold text-gray-900">{result.nom_complet_fr}</p>
                                    </div>

                                    {result.nom_complet_ar && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                الاسم الكامل (عربي)
                                            </label>
                                            <p className="text-lg font-semibold text-gray-900" dir="rtl">
                                                {result.nom_complet_ar}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                NNI
                                            </label>
                                            <p className="text-base font-mono text-gray-900">{formatNNI(result.nni)}</p>
                                        </div>

                                        {result.numero_dossier && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Numéro de dossier
                                                </label>
                                                <p className="text-base font-mono text-gray-900">{result.numero_dossier}</p>
                                            </div>
                                        )}
                                    </div>

                                    {(result.lieu_naissance || result.date_naissance) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {result.lieu_naissance && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                                        Lieu de naissance
                                                    </label>
                                                    <p className="text-base text-gray-900">{result.lieu_naissance}</p>
                                                </div>
                                            )}

                                            {result.date_naissance && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                                        Date de naissance
                                                    </label>
                                                    <p className="text-base text-gray-900">
                                                        {formatDate(result.date_naissance)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {result.nom_pere && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Nom du père
                                            </label>
                                            <p className="text-base text-gray-900">{result.nom_pere}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Résultat */}
                            <div className="lg:col-span-1">
                                <div className="bg-gray-50 rounded-lg p-6 h-full">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                                        Résultat de l&apos;examen
                                    </h3>

                                    <div className="text-center space-y-4">
                                        <div className={`inline-flex items-center px-6 py-3 rounded-full border text-lg font-bold ${getDecisionBadgeColor(result.decision)}`}>
                                            {result.decision}
                                        </div>

                                        {result.moyenne_generale && (
                                            <div>
                                                <p className="text-3xl font-bold text-mauritania-primary mb-1">
                                                    {formatMoyenne(result.moyenne_generale)}
                                                </p>
                                                <p className="text-sm text-gray-500">Moyenne générale</p>
                                            </div>
                                        )}

                                        {result.mention && (
                                            <div>
                                                <p className={`text-lg font-semibold ${getMentionColor(result.mention)}`}>
                                                    {result.mention}
                                                </p>
                                            </div>
                                        )}

                                        {result.total_points && (
                                            <div>
                                                <p className="text-xl font-bold text-gray-900">
                                                    {result.total_points} pts
                                                </p>
                                                <p className="text-sm text-gray-500">Total des points</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Informations de l'examen */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Informations de l&apos;examen</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {result.wilaya && (
                                    <div className="flex items-start space-x-3">
                                        <MapPin className="w-5 h-5 text-mauritania-primary mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Wilaya</p>
                                            <p className="text-base font-semibold text-gray-900">{result.wilaya.name_fr}</p>
                                            {result.wilaya.name_ar && (
                                                <p className="text-sm text-gray-600" dir="rtl">{result.wilaya.name_ar}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {result.etablissement && (
                                    <div className="flex items-start space-x-3">
                                        <Building className="w-5 h-5 text-mauritania-primary mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Établissement</p>
                                            <p className="text-base font-semibold text-gray-900">{result.etablissement.name_fr}</p>
                                            {result.etablissement.name_ar && (
                                                <p className="text-sm text-gray-600" dir="rtl">{result.etablissement.name_ar}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {result.serie && (
                                    <div className="flex items-start space-x-3">
                                        <GraduationCap className="w-5 h-5 text-mauritania-primary mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Série</p>
                                            <p className="text-base font-semibold text-gray-900">
                                                {result.serie.name_fr} ({result.serie.code})
                                            </p>
                                            {result.serie.name_ar && (
                                                <p className="text-sm text-gray-600" dir="rtl">{result.serie.name_ar}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start space-x-3">
                                    <Calendar className="w-5 h-5 text-mauritania-primary mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Date de publication</p>
                                        <p className="text-base font-semibold text-gray-900">
                                            {result.published_at ? formatDate(result.published_at) : formatDate(result.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {(result.centre_examen || result.centre_correction) && (
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {result.centre_examen && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Centre d&apos;examen</p>
                                            <p className="text-base text-gray-900">{result.centre_examen}</p>
                                        </div>
                                    )}

                                    {result.centre_correction && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Centre de correction</p>
                                            <p className="text-base text-gray-900">{result.centre_correction}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Classements */}
                        {(result.rang_etablissement || result.rang_wilaya || result.rang_national) && (
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <div className="flex items-center space-x-3 mb-6">
                                    <Trophy className="w-6 h-6 text-yellow-500" />
                                    <h3 className="text-xl font-bold text-gray-900">Classements</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {result.rang_etablissement && (
                                        <div className="text-center bg-yellow-50 rounded-lg p-6">
                                            <p className="text-3xl font-bold text-yellow-600 mb-2">#{result.rang_etablissement}</p>
                                            <p className="text-sm font-medium text-yellow-800">Classement établissement</p>
                                        </div>
                                    )}

                                    {result.rang_wilaya && (
                                        <div className="text-center bg-blue-50 rounded-lg p-6">
                                            <p className="text-3xl font-bold text-blue-600 mb-2">#{result.rang_wilaya}</p>
                                            <p className="text-sm font-medium text-blue-800">Classement wilaya</p>
                                        </div>
                                    )}

                                    {result.rang_national && (
                                        <div className="text-center bg-green-50 rounded-lg p-6">
                                            <p className="text-3xl font-bold text-green-600 mb-2">#{result.rang_national}</p>
                                            <p className="text-sm font-medium text-green-800">Classement national</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Métadonnées */}
                        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                    <Eye className="w-4 h-4" />
                                    <span>{result.view_count} vues</span>
                                </div>

                                {result.social_share_count > 0 && (
                                    <>
                                        <span>•</span>
                                        <span>{result.social_share_count} partages</span>
                                    </>
                                )}

                                <span>•</span>
                                <span>Document officiel certifié</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="btn-primary flex items-center justify-center space-x-2"
                    >
                        <Share2 className="w-5 h-5" />
                        <span>Partager ce résultat</span>
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="btn-secondary flex items-center justify-center space-x-2"
                    >
                        <Download className="w-5 h-5" />
                        <span>Imprimer</span>
                    </button>
                </div>
            </div>

            {/* Modal de partage */}
            {showShareModal && (
                <SocialShare
                    result={result}
                    onClose={() => setShowShareModal(false)}
                />
            )}
        </div>
    );
}