'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    Award,
    MapPin,
    Building,
    GraduationCap,
    ChevronDown,
    Search
} from 'lucide-react';
import { statsApi, referencesApi, sessionsApi } from '@/lib/api';
import { Wilaya, Session } from '@/types';
import { formatTauxReussite } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

interface GlobalStats {
    year: number;
    exam_type: string;
    total_candidats: number;
    total_admis: number;
    taux_reussite_global: number;
    wilayas: WilayaStats[];
    series: SerieStats[];
}

interface WilayaStats {
    id: number;
    name_fr: string;
    name_ar: string;
    candidats: number;
    admis: number;
    taux_reussite: number;
    moyenne?: number;
}

interface SerieStats {
    id: number;
    code: string;
    name_fr: string;
    name_ar: string;
    candidats: number;
    admis: number;
    taux_reussite: number;
}

export default function StatsPage() {
    // États
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedExamType, setSelectedExamType] = useState<string>('bac');
    const [selectedWilaya, setSelectedWilaya] = useState<number | null>(null);
    const [wilayas, setWilayas] = useState<Wilaya[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les données initiales
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [sessionsData, wilayasData] = await Promise.all([
                    sessionsApi.getPublished(),
                    referencesApi.getWilayas()
                ]);

                setSessions(sessionsData);
                setWilayas(wilayasData);

                // Prendre la session la plus récente par défaut
                if (sessionsData.length > 0) {
                    const latestSession = sessionsData.sort((a, b) => b.year - a.year)[0];
                    setSelectedYear(latestSession.year);
                    setSelectedExamType(latestSession.exam_type);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données initiales:', error);
                setError('Erreur lors du chargement des données');
            }
        };

        loadInitialData();
    }, []);

    // Charger les statistiques globales
    useEffect(() => {
        const loadGlobalStats = async () => {
            if (!selectedYear || !selectedExamType) return;

            setIsLoading(true);
            setError(null);

            try {
                const stats = await statsApi.getGlobalStats(selectedYear, selectedExamType);
                setGlobalStats(stats);
            } catch (error) {
                console.error('Erreur lors du chargement des statistiques:', error);
                setError('Statistiques non disponibles pour cette période');
            } finally {
                setIsLoading(false);
            }
        };

        loadGlobalStats();
    }, [selectedYear, selectedExamType]);

    // Années disponibles
    const availableYears = Array.from(
        new Set(sessions.map(s => s.year))
    ).sort((a, b) => b - a);

    // Types d'examens disponibles
    const availableExamTypes = Array.from(
        new Set(sessions.map(s => s.exam_type))
    );

    const examTypeLabels: Record<string, string> = {
        bac: 'Baccalauréat (BAC)',
        bepc: 'BEPC',
        concours: 'Concours'
    };

    if (isLoading && !globalStats) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="large" text="Chargement des statistiques..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* En-tête */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <BarChart3 className="w-8 h-8 text-mauritania-primary" />
                        <h1 className="text-3xl font-bold text-gray-900">Statistiques des examens</h1>
                    </div>
                    <p className="text-lg text-gray-600">
                        Découvrez les performances et tendances des examens mauritaniens
                    </p>
                </div>

                {/* Filtres */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Année */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Année
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="form-select"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* Type d'examen */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type d&apos;examen
                            </label>
                            <select
                                value={selectedExamType}
                                onChange={(e) => setSelectedExamType(e.target.value)}
                                className="form-select"
                            >
                                {availableExamTypes.map(type => (
                                    <option key={type} value={type}>
                                        {examTypeLabels[type] || type.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Wilaya */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Wilaya (optionnel)
                            </label>
                            <select
                                value={selectedWilaya || ''}
                                onChange={(e) => setSelectedWilaya(e.target.value ? Number(e.target.value) : null)}
                                className="form-select"
                            >
                                <option value="">Toutes les wilayas</option>
                                {wilayas.map(wilaya => (
                                    <option key={wilaya.id} value={wilaya.id}>
                                        {wilaya.name_fr}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {globalStats && (
                    <>
                        {/* Statistiques globales */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <div className="flex items-center">
                                    <Users className="w-10 h-10 text-blue-500 mr-4" />
                                    <div>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {globalStats.total_candidats.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-600">Total candidats</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <div className="flex items-center">
                                    <Award className="w-10 h-10 text-green-500 mr-4" />
                                    <div>
                                        <p className="text-3xl font-bold text-green-600">
                                            {globalStats.total_admis.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-600">Candidats admis</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <div className="flex items-center">
                                    <TrendingUp className="w-10 h-10 text-mauritania-primary mr-4" />
                                    <div>
                                        <p className="text-3xl font-bold text-mauritania-primary">
                                            {formatTauxReussite(globalStats.taux_reussite_global)}
                                        </p>
                                        <p className="text-sm text-gray-600">Taux de réussite</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <div className="flex items-center">
                                    <MapPin className="w-10 h-10 text-purple-500 mr-4" />
                                    <div>
                                        <p className="text-3xl font-bold text-purple-600">
                                            {globalStats.wilayas.length}
                                        </p>
                                        <p className="text-sm text-gray-600">Wilayas participantes</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Statistiques par wilaya */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <MapPin className="w-6 h-6 text-mauritania-primary mr-2" />
                                    Performances par Wilaya
                                </h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Wilaya
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Candidats
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Admis
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Taux de réussite
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Moyenne
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {globalStats.wilayas
                                            .sort((a, b) => b.taux_reussite - a.taux_reussite)
                                            .map((wilaya, index) => (
                                                <tr key={wilaya.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {wilaya.name_fr}
                                                            </div>
                                                            {index < 3 && (
                                                                <div className="ml-2 flex-shrink-0">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                                            index === 1 ? 'bg-gray-100 text-gray-800' :
                                                                                'bg-orange-100 text-orange-800'
                                                                        }`}>
                                                                        #{index + 1}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {wilaya.candidats.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                        {wilaya.admis.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                                                                <div
                                                                    className="bg-mauritania-primary h-2 rounded-full"
                                                                    style={{ width: `${Math.min(wilaya.taux_reussite, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {formatTauxReussite(wilaya.taux_reussite)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {wilaya.moyenne ? `${wilaya.moyenne.toFixed(2)}/20` : 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Statistiques par série */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <GraduationCap className="w-6 h-6 text-mauritania-primary mr-2" />
                                    Performances par Série
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {globalStats.series
                                    .sort((a, b) => b.taux_reussite - a.taux_reussite)
                                    .map((serie, index) => (
                                        <div key={serie.id} className="bg-gray-50 rounded-lg p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {serie.name_fr}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">({serie.code})</p>
                                                </div>
                                                {index < 3 && (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                            index === 1 ? 'bg-gray-100 text-gray-800' :
                                                                'bg-orange-100 text-orange-800'
                                                        }`}>
                                                        #{index + 1}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Candidats:</span>
                                                    <span className="font-medium">{serie.candidats.toLocaleString()}</span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Admis:</span>
                                                    <span className="font-medium text-green-600">{serie.admis.toLocaleString()}</span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Taux de réussite:</span>
                                                    <span className="font-bold text-mauritania-primary">
                                                        {formatTauxReussite(serie.taux_reussite)}
                                                    </span>
                                                </div>

                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-mauritania-primary h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(serie.taux_reussite, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}