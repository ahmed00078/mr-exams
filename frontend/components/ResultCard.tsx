'use client';

import Link from 'next/link';
import { ExamResult } from '@/types';
import { getDecisionBadgeColor, formatMoyenne, getMentionColor, formatNNI } from '@/lib/utils';
import { User, MapPin, Building, GraduationCap, Calendar, Eye, Trophy } from 'lucide-react';

interface ResultCardProps {
    result: ExamResult;
    showDetails?: boolean;
}

export default function ResultCard({ result, showDetails = true }: ResultCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">

                {/* En-tête avec informations principales */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <User className="w-5 h-5 text-gray-400" />
                            <h3 className="text-xl font-bold text-gray-900">
                                {result.nom_complet_fr}
                            </h3>
                        </div>

                        {result.nom_complet_ar && (
                            <p className="text-lg text-gray-600 mb-2" dir="rtl">
                                {result.nom_complet_ar}
                            </p>
                        )}

                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>NNI: {formatNNI(result.nni)}</span>
                            {result.numero_dossier && (
                                <>
                                    <span>•</span>
                                    <span>Dossier: {result.numero_dossier}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Décision et moyenne */}
                    <div className="mt-4 lg:mt-0 lg:text-right">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-semibold ${getDecisionBadgeColor(result.decision)}`}>
                            {result.decision}
                        </div>

                        {result.moyenne_generale && (
                            <div className="mt-2">
                                <span className="text-2xl font-bold text-mauritania-primary">
                                    {formatMoyenne(result.moyenne_generale)}
                                </span>
                            </div>
                        )}

                        {result.mention && (
                            <div className={`text-sm font-medium mt-1 ${getMentionColor(result.mention)}`}>
                                {result.mention}
                            </div>
                        )}
                    </div>
                </div>

                {/* Informations détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                    {/* Wilaya */}
                    {result.wilaya && (
                        <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Wilaya</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {result.wilaya.name_fr}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Établissement */}
                    {result.etablissement && (
                        <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Établissement</p>
                                <p className="text-sm font-medium text-gray-900 truncate" title={result.etablissement.name_fr}>
                                    {result.etablissement.name_fr}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Série */}
                    {result.serie && (
                        <div className="flex items-center space-x-2">
                            <GraduationCap className="w-4 h-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Série</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {result.serie.name_fr} ({result.serie.code})
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Date */}
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Publié le</p>
                            <p className="text-sm font-medium text-gray-900">
                                {new Date(result.created_at).toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Classements (si disponibles) */}
                {(result.rang_etablissement || result.rang_wilaya || result.rang_national) && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex items-center space-x-2 mb-3">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <h4 className="text-sm font-semibold text-gray-700">Classements</h4>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            {result.rang_etablissement && (
                                <div>
                                    <p className="text-lg font-bold text-gray-900">#{result.rang_etablissement}</p>
                                    <p className="text-xs text-gray-500">Établissement</p>
                                </div>
                            )}

                            {result.rang_wilaya && (
                                <div>
                                    <p className="text-lg font-bold text-gray-900">#{result.rang_wilaya}</p>
                                    <p className="text-xs text-gray-500">Wilaya</p>
                                </div>
                            )}

                            {result.rang_national && (
                                <div>
                                    <p className="text-lg font-bold text-gray-900">#{result.rang_national}</p>
                                    <p className="text-xs text-gray-500">National</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                {showDetails && (
                    <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4 sm:mb-0">
                            <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>{result.view_count} vues</span>
                            </div>

                        </div>

                        <Link
                            href={`/result/${result.id}`}
                            className="btn-primary text-sm px-4 py-2"
                        >
                            Voir le détail
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}