'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    Search,
    MapPin,
    Building,
    GraduationCap,
    Users,
    Trophy,
    Calendar,
    Target,
    Medal,
    School,
    TrendingUp,
    Award
} from 'lucide-react';
import { sessionsApi, referencesApi, statsApi, resultsApi } from '@/lib/api';
import { Session, Serie, Wilaya } from '@/types';
import { formatTauxReussite, getExamTypeLabel } from '@/lib/utils';

export default function ExamPage() {
    const params = useParams();
    const router = useRouter();
    const examParam = params.exam as string; // ex: "bac-2024"

    // Parser le paramètre d'examen
    const [examType, year] = examParam.split('-');
    const numericYear = parseInt(year);

    // États
    const [session, setSession] = useState<Session | null>(null);
    const [series, setSeries] = useState<Serie[]>([]);
    const [wilayas, setWilayas] = useState<Wilaya[]>([]);
    const [globalStats, setGlobalStats] = useState<any>(null);
    const [topStudents, setTopStudents] = useState<any[]>([]);
    const [topSchools, setTopSchools] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Charger toutes les données en parallèle
                const [sessionsData, seriesData, wilayasData] = await Promise.all([
                    sessionsApi.getPublished(examType, numericYear),
                    referencesApi.getSeries(examType),
                    referencesApi.getWilayas()
                ]);

                // Trouver la session correspondante
                const currentSession = sessionsData.find(s =>
                    s.exam_type === examType && s.year === numericYear
                );

                if (!currentSession) {
                    router.push('/');
                    return;
                }

                setSession(currentSession);
                setSeries(seriesData.filter(s => s.exam_type === examType));
                setWilayas(wilayasData);

                // Charger les statistiques globales et les tops
                try {
                    const [stats, studentsData, schoolsData] = await Promise.all([
                        statsApi.getGlobalStats(numericYear, examType),
                        statsApi.getTopStudents(numericYear, examType, 5),
                        statsApi.getTopSchools(numericYear, examType, 5)
                    ]);
                    setGlobalStats(stats);
                    setTopStudents(studentsData.top_students || []);
                    setTopSchools(schoolsData.top_schools || []);
                } catch (error) {
                    console.log('Stats not available');
                }

            } catch (error) {
                console.error('Erreur chargement:', error);
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        if (examType && numericYear) {
            loadData();
        }
    }, [examType, numericYear, router]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        const trimmedTerm = searchTerm.trim();
        
        try {
            // Déterminer le type de recherche
            const isNNI = /^\d{10,}$/.test(trimmedTerm); // NNI (au moins 10 chiffres)
            const isNumeroDossier = /^\d{4,9}$/.test(trimmedTerm); // Numéro dossier (4-9 chiffres)
            
            let searchParams: any = {
                exam_type: examType,
                year: numericYear,
                page: 1,
                size: 50
            };

            if (isNNI) {
                searchParams.nni = trimmedTerm;
            } else if (isNumeroDossier) {
                searchParams.numero_dossier = trimmedTerm;
            } else {
                searchParams.nom = trimmedTerm;
            }

            // Effectuer la recherche
            const results = await resultsApi.search(searchParams);
            
            if (results.results && results.results.length > 0) {
                if (results.results.length === 1) {
                    // Un seul résultat trouvé, rediriger directement
                    router.push(`/result/${results.results[0].id}`);
                } else {
                    // Plusieurs résultats, aller à la page de résultats avec recherche
                    const queryParams = new URLSearchParams();
                    if (isNNI) queryParams.set('nni', trimmedTerm);
                    else if (isNumeroDossier) queryParams.set('numero_dossier', trimmedTerm);
                    else queryParams.set('nom', trimmedTerm);
                    
                    router.push(`/${examParam}/resultats?${queryParams.toString()}`);
                }
            } else {
                // Aucun résultat trouvé
                alert('Aucun résultat trouvé pour cette recherche.');
            }
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            alert('Erreur lors de la recherche. Veuillez réessayer.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - TailAdmin Style */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.push('/')}
                                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour à l'accueil
                            </Button>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                                    <GraduationCap className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                        {getExamTypeLabel(examType)} {year}
                                    </h1>
                                    <p className="text-gray-600 text-sm">{session.session_name}</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-28"></div> {/* Spacer for centering */}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Search Section - TailAdmin Professional Style */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-200 p-4 md:p-8 mb-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium mb-4">
                            <Search className="w-4 h-4" />
                            Recherche de résultats
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Trouvez vos résultats
                        </h2>
                        <p className="text-gray-600">
                            Entrez votre NNI, numéro de dossier ou nom complet pour accéder à vos résultats
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="flex gap-3">
                            <Input
                                placeholder="NNI, numéro de dossier ou nom complet..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="h-12 px-4 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-lg"
                            />
                            <Button
                                onClick={handleSearch}
                                disabled={!searchTerm.trim()}
                                className="px-6 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                            >
                                <Search className="w-5 h-5 mr-2" />
                                Rechercher
                            </Button>
                        </div>
                        
                        <div className="text-center">
                            <Link href={`/${examParam}/resultats`}>
                                <Button variant="outline" className="w-full h-12 rounded-xl border-gray-300 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                                    <Users className="w-5 h-5 mr-2" />
                                    Parcourir tous les résultats avec filtres avancés
                                </Button>
                            </Link>
                        </div>

                        {/* Search Tips */}
                        <div className="bg-gray-50 rounded-2xl p-4">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm">💡 Conseils de recherche :</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span><strong>NNI :</strong> 10 chiffres minimum</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span><strong>Dossier :</strong> 4-9 chiffres</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span><strong>Nom :</strong> Prénom + Nom</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Dashboard - TailAdmin Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    {/* Quick Stats Cards */}
                    {globalStats && (
                        <>
                            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                                        <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                    </div>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">Total</span>
                                </div>
                                <div>
                                    <p className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                                        {globalStats.total_candidats?.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600">Candidats inscrits</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                                        <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                    </div>
                                    <span className="text-xs text-white bg-green-500 px-2 py-1 rounded-lg">Admis</span>
                                </div>
                                <div>
                                    <p className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                                        {globalStats.total_admis?.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600">Candidats admis</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                        <Target className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                    </div>
                                    <span className="text-xs text-white bg-purple-500 px-2 py-1 rounded-lg">Taux</span>
                                </div>
                                <div>
                                    <p className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                                        {formatTauxReussite(globalStats.taux_reussite_global)}
                                    </p>
                                    <p className="text-sm text-gray-600">Taux de réussite</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                                        <Building className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                    </div>
                                    <span className="text-xs text-white bg-orange-500 px-2 py-1 rounded-lg">Écoles</span>
                                </div>
                                <div>
                                    <p className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                                        {globalStats.total_etablissements?.toLocaleString() || '-'}
                                    </p>
                                    <p className="text-sm text-gray-600">Établissements</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Success Rate Visualization - TailAdmin Style */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-lg border border-gray-200">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium mb-4">
                                    <Target className="w-4 h-4" />
                                    Taux de réussite
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Résultats Globaux</h3>
                            </div>

                            {globalStats && (
                                <div className="space-y-8">
                                    {/* Modern Circular Progress */}
                                    <div className="relative w-32 h-32 md:w-48 md:h-48 mx-auto">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                                            {/* Background circle */}
                                            <circle 
                                                cx="100" 
                                                cy="100" 
                                                r="80" 
                                                fill="none" 
                                                stroke="#f3f4f6" 
                                                strokeWidth="16"
                                            />
                                            
                                            {/* Progress circle */}
                                            <circle 
                                                cx="100" 
                                                cy="100" 
                                                r="80" 
                                                fill="none" 
                                                stroke="url(#gradient)" 
                                                strokeWidth="16"
                                                strokeDasharray={`${(globalStats.taux_reussite_global || 0) * 5.03} 503`}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000 ease-out"
                                            />
                                            
                                            {/* Gradient definition */}
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#10b981" />
                                                    <stop offset="100%" stopColor="#059669" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        
                                        {/* Center content */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">
                                                    {formatTauxReussite(globalStats.taux_reussite_global)}
                                                </div>
                                                <div className="text-sm text-gray-500">de réussite</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats breakdown */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-green-50 rounded-2xl">
                                            <div className="text-lg md:text-xl font-bold text-green-600 mb-1">
                                                {globalStats.total_admis?.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-600 flex items-center justify-center gap-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                Admis
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-red-50 rounded-2xl">
                                            <div className="text-lg md:text-xl font-bold text-red-600 mb-1">
                                                {((globalStats.total_candidats || 0) - (globalStats.total_admis || 0)).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-600 flex items-center justify-center gap-2">
                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                Ajournés
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rankings Section - 2 Column Layout */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Top Students - TailAdmin Style */}
                        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl text-sm font-medium mb-2">
                                        <Award className="w-4 h-4" />
                                        Classement
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Top 5 Élèves</h3>
                                </div>
                                <Link href={`/${examParam}/resultats`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                    Voir tout →
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {topStudents.map((student: any, index: number) => (
                                    <Link key={student.id} href={`/result/${student.id}`} className="block">
                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-gray-100 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold ${
                                                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' : 
                                                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' : 
                                                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' : 
                                                    'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                                        {student.nom_complet}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {student.wilaya} • Série {student.serie}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-green-600 mb-1">
                                                    {student.moyenne.toFixed(2)}
                                                </div>
                                                <div className="text-xs text-gray-500">/ 20</div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Top Regions & Schools Combined */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Top Wilayas */}
                            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg border border-gray-200">
                                <div className="mb-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium mb-2">
                                        <MapPin className="w-4 h-4" />
                                        Régions
                                    </div>
                                    <h3 className="text-base md:text-lg font-bold text-gray-900">Top Wilayas</h3>
                                </div>

                                <div className="space-y-3">
                                    {globalStats?.wilayas?.slice(0, 5).map((wilaya: any, index: number) => (
                                        <Link 
                                            key={wilaya.id} 
                                            href={`/${examParam}/resultats?wilaya=${wilaya.id}`}
                                            className="block"
                                        >
                                            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                                                        index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                                        index === 1 ? 'bg-gray-100 text-gray-700' : 
                                                        index === 2 ? 'bg-orange-100 text-orange-700' : 
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                            {wilaya.name_fr}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base md:text-lg font-bold text-green-600">
                                                        {wilaya.taux_reussite}%
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Top Schools */}
                            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg border border-gray-200">
                                <div className="mb-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-medium mb-2">
                                        <School className="w-4 h-4" />
                                        Établissements
                                    </div>
                                    <h3 className="text-base md:text-lg font-bold text-gray-900">Top Écoles</h3>
                                </div>

                                <div className="space-y-3">
                                    {topSchools.slice(0, 5).map((school: any, index: number) => (
                                        <Link 
                                            key={school.id} 
                                            href={`/${examParam}/resultats?etablissement=${school.id}`}
                                            className="block"
                                        >
                                            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center text-xs font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                                            {school.nom}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{school.wilaya}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs md:text-sm font-bold text-green-600 ml-2">
                                                    {school.taux_reussite}%
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}