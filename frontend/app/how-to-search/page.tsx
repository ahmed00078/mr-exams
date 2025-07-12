'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, CreditCard, FileText, TrendingUp } from 'lucide-react';

export default function HowToSearchPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50">
            
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* En-tête */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Retour</span>
                    </button>
                    
                    <div className="flex items-center space-x-3 mb-4">
                        <Search className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Comment Rechercher
                        </h1>
                    </div>
                    
                    <p className="text-gray-600 text-lg">
                        Guide simple pour trouver vos résultats d'examens
                    </p>
                </div>

                {/* Contenu */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
                    
                    {/* Méthodes de recherche */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        
                        {/* Par NNI */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Par NNI</h2>
                            </div>
                            <p className="text-gray-700 mb-4">
                                La méthode la plus rapide et fiable.
                            </p>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">1. Entrez votre numéro NNI (10 chiffres)</p>
                                <p className="text-sm text-gray-600">2. Sélectionnez le type d'examen</p>
                                <p className="text-sm text-gray-600">3. Cliquez sur "Rechercher"</p>
                            </div>
                        </div>

                        {/* Par informations */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <FileText className="w-6 h-6 text-green-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Par Nom</h2>
                            </div>
                            <p className="text-gray-700 mb-4">
                                Si vous n'avez pas votre NNI.
                            </p>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">1. Entrez votre nom complet</p>
                                <p className="text-sm text-gray-600">2. Sélectionnez votre wilaya</p>
                                <p className="text-sm text-gray-600">3. Affinez avec l'établissement</p>
                            </div>
                        </div>
                    </div>

                    {/* Conseils */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Conseils utiles</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li>• Vérifiez bien l'orthographe de votre nom</li>
                            <li>• Le NNI doit contenir exactement 10 chiffres</li>
                            <li>• Utilisez le nom tel qu'il apparaît sur vos documents officiels</li>
                            <li>• Les résultats sont disponibles dès leur publication officielle</li>
                        </ul>
                    </div>

                    {/* Statistiques */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Consulter les Statistiques</h3>
                        </div>
                        <p className="text-gray-700 mb-3">
                            Découvrez les statistiques globales et par région dans la section 
                            <a href="/stats" className="text-purple-600 hover:text-purple-800 font-medium ml-1">Statistiques</a>.
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
}
