'use client';

import { useState } from 'react';
import {
    X,
    Facebook,
    Twitter,
    MessageCircle,
    Send,
    Linkedin,
    Copy,
    CheckCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import { ExamResultDetail } from '@/types';
import { resultsApi } from '@/lib/api';
import { generateShareUrl, copyToClipboard, formatMoyenne } from '@/lib/utils';

interface SocialShareProps {
    result: ExamResultDetail;
    onClose: () => void;
}

export default function SocialShare({ result, onClose }: SocialShareProps) {
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [shareUrls, setShareUrls] = useState<Record<string, string>>({});
    const [copied, setCopied] = useState(false);

    // Générer un lien de partage
    const generateShare = async (platform: string) => {
        if (shareUrls[platform]) {
            return shareUrls[platform];
        }

        setIsLoading(true);
        try {
            const shareData = await resultsApi.createShare({
                result_id: result.id,
                platform: platform as any,
                is_anonymous: isAnonymous
            });

            setShareUrls(prev => ({
                ...prev,
                [platform]: shareData.share_url
            }));

            return shareData.share_url;
        } catch (error) {
            console.error('Erreur lors de la génération du lien:', error);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Ouvrir le partage sur une plateforme
    const handleShare = async (platform: string) => {
        const shareUrl = await generateShare(platform);
        if (!shareUrl) return;

        const candidateName = isAnonymous ? 'Candidat' : result.nom_complet_fr;
        const text = `🎓 Résultat ${result.serie?.exam_type?.toUpperCase() || 'BAC'} 2024 - ${candidateName}: ${result.decision}`;

        const finalUrl = generateShareUrl(platform, shareUrl, text);

        if (platform === 'copy') {
            try {
                await copyToClipboard(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                console.error('Erreur lors de la copie:', error);
            }
        } else {
            window.open(finalUrl, '_blank', 'width=600,height=400');
        }
    };

    const platforms = [
        {
            id: 'facebook',
            name: 'Facebook',
            icon: Facebook,
            color: 'bg-blue-600 hover:bg-blue-700',
            description: 'Partager sur Facebook'
        },
        {
            id: 'twitter',
            name: 'Twitter',
            icon: Twitter,
            color: 'bg-sky-500 hover:bg-sky-600',
            description: 'Partager sur Twitter'
        },
        {
            id: 'whatsapp',
            name: 'WhatsApp',
            icon: MessageCircle,
            color: 'bg-green-600 hover:bg-green-700',
            description: 'Partager sur WhatsApp'
        },
        {
            id: 'telegram',
            name: 'Telegram',
            icon: Send,
            color: 'bg-blue-500 hover:bg-blue-600',
            description: 'Partager sur Telegram'
        },
        {
            id: 'linkedin',
            name: 'LinkedIn',
            icon: Linkedin,
            color: 'bg-blue-700 hover:bg-blue-800',
            description: 'Partager sur LinkedIn'
        },
        {
            id: 'copy',
            name: 'Copier le lien',
            icon: copied ? CheckCircle : Copy,
            color: copied ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-700',
            description: 'Copier le lien de partage'
        }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">

                {/* En-tête */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Partager le résultat</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Aperçu du résultat */}
                <div className="p-6 border-b border-gray-200">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">
                                {isAnonymous ? 'Candidat' : result.nom_complet_fr}
                            </h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setIsAnonymous(!isAnonymous)}
                                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                                >
                                    {isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    <span>{isAnonymous ? 'Anonyme' : 'Public'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Examen:</strong> {result.serie?.exam_type?.toUpperCase() || 'BAC'} 2024</p>
                            <p><strong>Décision:</strong> {result.decision}</p>
                            {result.moyenne_generale && (
                                <p><strong>Moyenne:</strong> {formatMoyenne(result.moyenne_generale)}</p>
                            )}
                            {result.wilaya && !isAnonymous && (
                                <p><strong>Wilaya:</strong> {result.wilaya.name_fr}</p>
                            )}
                        </div>
                    </div>

                    {isAnonymous && (
                        <div className="mt-3 flex items-start space-x-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                            <EyeOff className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>Le partage anonyme masque le nom du candidat et les informations personnelles.</p>
                        </div>
                    )}
                </div>

                {/* Options de partage */}
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Choisir une plateforme
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        {platforms.map((platform) => {
                            const Icon = platform.icon;
                            const isCurrentCopied = platform.id === 'copy' && copied;

                            return (
                                <button
                                    key={platform.id}
                                    onClick={() => handleShare(platform.id)}
                                    disabled={isLoading}
                                    className={`${platform.color} text-white p-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center space-y-2`}
                                >
                                    <Icon className="w-6 h-6" />
                                    <span className="text-sm font-medium">
                                        {isCurrentCopied ? 'Copié!' : platform.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Informations légales */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">
                            ℹ️ Informations importantes
                        </h4>
                        <ul className="text-xs text-blue-800 space-y-1">
                            <li>• Les liens de partage sont sécurisés et temporaires (30 jours)</li>
                            <li>• Seules les informations autorisées sont partagées</li>
                            <li>• Le partage respecte la confidentialité des données</li>
                            <li>• Les résultats partagés sont authentifiés officiellement</li>
                        </ul>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full btn-secondary"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}