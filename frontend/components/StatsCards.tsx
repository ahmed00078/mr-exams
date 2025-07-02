'use client';

import { Users, Award, TrendingUp, Building } from 'lucide-react';

interface StatsCardsProps {
    stats?: {
        totalCandidates?: number;
        totalAdmis?: number;
        tauxReussite?: number;
        totalEtablissements?: number;
    };
    isLoading?: boolean;
}

export default function StatsCards({ stats, isLoading = false }: StatsCardsProps) {
    const defaultStats = {
        totalCandidates: stats?.totalCandidates || 0,
        totalAdmis: stats?.totalAdmis || 0,
        tauxReussite: stats?.tauxReussite || 0,
        totalEtablissements: stats?.totalEtablissements || 0,
    };

    const cards = [
        {
            title: 'Total candidats',
            value: defaultStats.totalCandidates.toLocaleString(),
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            description: 'Candidats inscrits'
        },
        {
            title: 'Candidats admis',
            value: defaultStats.totalAdmis.toLocaleString(),
            icon: Award,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            description: 'Résultats positifs'
        },
        {
            title: 'Taux de réussite',
            value: `${defaultStats.tauxReussite.toFixed(1)}%`,
            icon: TrendingUp,
            color: 'text-mauritania-primary',
            bgColor: 'bg-blue-50',
            description: 'Performance globale'
        },
        {
            title: 'Établissements',
            value: defaultStats.totalEtablissements.toLocaleString(),
            icon: Building,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            description: 'Centres d\'examen'
        }
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="animate-pulse">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300"
                    >
                        <div className="flex items-center">
                            <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center mr-4`}>
                                <Icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                    {card.title}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mb-1">
                                    {card.value}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {card.description}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}