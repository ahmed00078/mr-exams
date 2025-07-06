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
        <div className="min-h-screen bg-background">
            {/* En-tête avec retour */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        {/* <Button
                            variant="ghost"
                            onClick={() => router.push('/')}
                            className="p-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Accueil
                        </Button> */}

                        <div className="flex items-center space-x-3">
                            <GraduationCap className="w-8 h-8 text-primary" />
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {getExamTypeLabel(examType)} {year}
                                </h1>
                                <p className="text-muted-foreground">{session.session_name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Barre de recherche discrète */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="max-w-xl mx-auto space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="NNI, numéro de dossier ou nom..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="h-10"
                                />
                                <Button
                                    onClick={handleSearch}
                                    disabled={!searchTerm.trim()}
                                    size="sm"
                                    className="px-4"
                                >
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                            
                            <div className="text-center">
                                <Link href={`/${examParam}/resultats`}>
                                    <Button variant="outline" className="w-full">
                                        <Users className="w-4 h-4 mr-2" />
                                        Voir tous les résultats avec filtres
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dashboard Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Cercle de pourcentage - Bloc principal */}
                    <Card className="md:col-span-2 lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                Résultats Globaux
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {globalStats && (
                                <div className="space-y-6">
                                    {/* Graphique circulaire simulé */}
                                    <div className="relative w-40 h-40 mx-auto">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                            {/* Cercle de fond */}
                                            <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
                                            
                                            {/* Cercle des admis (vert) */}
                                            <circle 
                                                cx="60" 
                                                cy="60" 
                                                r="50" 
                                                fill="none" 
                                                stroke="#10b981" 
                                                strokeWidth="10"
                                                strokeDasharray={`${(globalStats.taux_reussite_global || 0) * 3.14} 314`}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000"
                                            />
                                        </svg>
                                        
                                        {/* Pourcentage au centre */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {formatTauxReussite(globalStats.taux_reussite_global)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Admis</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Légende */}
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <div className="text-lg font-semibold text-green-600">
                                                {globalStats.total_admis?.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                Admis
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-semibold text-red-600">
                                                {((globalStats.total_candidats || 0) - (globalStats.total_admis || 0)).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                Ajournés
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top 3 Wilayas */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Top Wilayas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {globalStats?.wilayas?.slice(0, 3).map((wilaya: any, index: number) => (
                                    <Link 
                                        key={wilaya.id} 
                                        href={`/${examParam}/resultats?wilaya=${wilaya.id}`}
                                        className="block"
                                    >
                                        <div className={`flex items-center justify-between p-3 rounded-lg border-l-4 hover:shadow-md transition-shadow cursor-pointer ${
                                            index === 0 ? 'bg-yellow-50 border-yellow-500 hover:bg-yellow-100' : 
                                            index === 1 ? 'bg-gray-50 border-gray-400 hover:bg-gray-100' : 
                                            'bg-orange-50 border-orange-500 hover:bg-orange-100'
                                        }`}>
                                            <div className="flex items-center gap-2">
                                                <Medal className={`w-4 h-4 ${
                                                    index === 0 ? 'text-yellow-600' : 
                                                    index === 1 ? 'text-gray-600' : 
                                                    'text-orange-600'
                                                }`} />
                                                <div>
                                                    <p className="font-medium text-sm">{wilaya.name_fr}</p>
                                                    <p className="text-xs text-muted-foreground">#{index + 1}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-semibold ${
                                                index === 0 ? 'text-yellow-700' : 
                                                index === 1 ? 'text-gray-700' : 
                                                'text-orange-700'
                                            }`}>
                                                {wilaya.taux_reussite}%
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistiques générales */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Statistiques
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {globalStats && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                        <p className="text-lg font-bold">{globalStats.total_candidats?.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">Candidats</p>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <Trophy className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                        <p className="text-lg font-bold">{globalStats.total_admis?.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">Admis</p>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                        <Building className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                                        <p className="text-lg font-bold">
                                            {globalStats.total_etablissements?.toLocaleString() || '-'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Établissements</p>
                                    </div>
                                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                                        <GraduationCap className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                                        <p className="text-lg font-bold">{globalStats.series?.length || 4}</p>
                                        <p className="text-xs text-muted-foreground">Séries</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Élèves - Bloc important */}
                    <Card className="md:col-span-2 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Top 5 Élèves
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topStudents.map((student: any, index: number) => (
                                    <Link key={student.id} href={`/result/${student.id}`} className="block">
                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    index === 0 ? 'bg-yellow-500 text-white' : 
                                                    index === 1 ? 'bg-gray-400 text-white' : 
                                                    index === 2 ? 'bg-orange-500 text-white' : 
                                                    'bg-blue-500 text-white'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm hover:text-primary transition-colors">
                                                        {student.nom_complet}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {student.wilaya} • Série {student.serie}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-2">
                                                <div>
                                                    <p className="text-lg font-bold text-green-600">{student.moyenne.toFixed(2)}</p>
                                                    <p className="text-xs text-muted-foreground">/ 20</p>
                                                </div>
                                                <ArrowLeft className="w-4 h-4 rotate-180 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Écoles */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <School className="w-5 h-5" />
                                Top Écoles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topSchools.map((school: any, index: number) => (
                                    <Link 
                                        key={school.id} 
                                        href={`/${examParam}/resultats?etablissement=${school.id}`}
                                        className="block"
                                    >
                                        <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 hover:shadow-md transition-all cursor-pointer">
                                            <div>
                                                <p className="font-medium text-sm">{school.nom}</p>
                                                <p className="text-xs text-muted-foreground">{school.wilaya}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-green-600">{school.taux_reussite}%</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}