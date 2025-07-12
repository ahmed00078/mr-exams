'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Users, AlertTriangle, Scale, CheckCircle, XCircle } from 'lucide-react';

export default function TermsOfServicePage() {
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
                        <Scale className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Conditions d'Utilisation
                        </h1>
                    </div>
                    
                    <p className="text-gray-600 text-lg">
                        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                    </p>
                </div>

                {/* Contenu */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
                    <div className="prose prose-lg max-w-none">
                        
                        {/* Introduction */}
                        <section className="mb-8">
                            <div className="flex items-center space-x-2 mb-4">
                                <FileText className="w-6 h-6 text-green-600" />
                                <h2 className="text-2xl font-semibold text-gray-900">Introduction</h2>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                En accédant et en utilisant cette plateforme de consultation des résultats d'examens, 
                                vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas 
                                ces conditions, veuillez ne pas utiliser ce service.
                            </p>
                        </section>

                        {/* Description du service */}
                        <section className="mb-8">
                            <div className="flex items-center space-x-2 mb-4">
                                <Users className="w-6 h-6 text-blue-600" />
                                <h2 className="text-2xl font-semibold text-gray-900">Description du Service</h2>
                            </div>
                            <div className="space-y-4 text-gray-700">
                                <p>
                                    Notre plateforme permet aux candidats et au public de consulter les résultats 
                                    des examens officiels en Mauritanie, notamment :
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Résultats du Baccalauréat</li>
                                    <li>Résultats du BEPC</li>
                                    <li>Résultats du concours d'entrée en première année du collège</li>
                                    <li>Statistiques et classements</li>
                                </ul>
                                <p>
                                    Le service est fourni gratuitement et accessible 24h/24 sous réserve 
                                    de maintenance technique.
                                </p>
                            </div>
                        </section>

                        {/* Utilisation acceptable */}
                        <section className="mb-8">
                            <div className="flex items-center space-x-2 mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <h2 className="text-2xl font-semibold text-gray-900">Utilisation Acceptable</h2>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <p className="text-gray-700 mb-3"><strong>Vous êtes autorisé à :</strong></p>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    <li>Consulter vos propres résultats d'examen</li>
                                    <li>Rechercher des résultats avec les informations appropriées</li>
                                    <li>Partager vos résultats via les liens fournis</li>
                                    <li>Consulter les statistiques publiques</li>
                                    <li>Utiliser le service à des fins éducatives</li>
                                </ul>
                            </div>
                        </section>

                        {/* Utilisation interdite */}
                        <section className="mb-8">
                            <div className="flex items-center space-x-2 mb-4">
                                <XCircle className="w-6 h-6 text-red-600" />
                                <h2 className="text-2xl font-semibold text-gray-900">Utilisation Interdite</h2>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <p className="text-gray-700 mb-3"><strong>Il est strictement interdit de :</strong></p>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    <li>Utiliser des robots, scripts ou outils automatisés</li>
                                    <li>Tenter d'accéder à des données non autorisées</li>
                                    <li>Perturber le fonctionnement du service</li>
                                    <li>Copier ou redistribuer les données sans autorisation</li>
                                    <li>Usurper l'identité d'un autre candidat</li>
                                    <li>Utiliser le service à des fins commerciales</li>
                                </ul>
                            </div>
                        </section>

                        {/* Responsabilités */}
                        <section className="mb-8">
                            <div className="flex items-center space-x-2 mb-4">
                                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                                <h2 className="text-2xl font-semibold text-gray-900">Responsabilités</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nos responsabilités :</h3>
                                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                                        <li>Fournir des informations exactes et à jour</li>
                                        <li>Maintenir la sécurité et la confidentialité des données</li>
                                        <li>Assurer la disponibilité du service dans la mesure du possible</li>
                                        <li>Respecter la réglementation en vigueur</li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Vos responsabilités :</h3>
                                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                                        <li>Utiliser le service conformément à ces conditions</li>
                                        <li>Protéger vos informations personnelles</li>
                                        <li>Signaler tout dysfonctionnement ou abus</li>
                                        <li>Respecter les droits des autres utilisateurs</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Limitation de responsabilité */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation de Responsabilité</h2>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-gray-700 mb-3">
                                    Bien que nous nous efforcions de maintenir l'exactitude et la disponibilité 
                                    du service, nous ne pouvons garantir :
                                </p>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    <li>L'absence d'interruptions de service</li>
                                    <li>L'absence d'erreurs techniques</li>
                                    <li>La disponibilité permanente de toutes les fonctionnalités</li>
                                </ul>
                                <p className="text-gray-700 mt-3">
                                    En cas de problème, nous nous engageons à résoudre les difficultés 
                                    dans les meilleurs délais.
                                </p>
                            </div>
                        </section>

                        {/* Propriété intellectuelle */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Propriété Intellectuelle</h2>
                            <div className="text-gray-700 space-y-3">
                                <p>
                                    Tous les contenus de cette plateforme (design, code, logos, textes) 
                                    sont la propriété du Ahmed Sidi Mohamed 
                                    et sont protégés par les lois sur la propriété intellectuelle.
                                </p>
                                <p>
                                    Les données des résultats d'examens restent la propriété de l'État mauritanien 
                                    et sont mises à disposition dans un cadre de service public.
                                </p>
                            </div>
                        </section>

                        {/* Modifications */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Modifications</h2>
                            <p className="text-gray-700">
                                Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. 
                                Les modifications entrent en vigueur dès leur publication sur cette page. 
                                Il est de votre responsabilité de consulter régulièrement ces conditions.
                            </p>
                        </section>

                        {/* Contact */}
                        <section className="bg-gray-50 rounded-lg p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
                            <p className="text-gray-700 mb-4">
                                Pour toute question concernant ces conditions d'utilisation, contactez-nous :
                            </p>
                            <div className="text-gray-700">
                                <p><strong>Email :</strong> ahmed@ahmed78.me</p>
                                <p><strong>Téléphone :</strong> +222 20087182</p>
                                <p><strong>Adresse :</strong> Ministère de l'Éducation Nationale, Nouakchott, Mauritanie</p>
                            </div>
                        </section>

                    </div>
                </div>
            </main>
        </div>
    );
} 