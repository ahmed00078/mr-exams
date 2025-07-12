'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
                        <Shield className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Politique de Confidentialité
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
                                <Eye className="w-6 h-6 text-green-600" />
                                <h2 className="text-2xl font-semibold text-gray-900">Introduction</h2>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                Cette politique de confidentialité décrit comment nous collectons, utilisons, 
                                protégeons et partageons vos informations personnelles lorsque vous utilisez 
                                notre plateforme de consultation des résultats d'examens.
                            </p>
                        </section>

                        {/* Collecte des données */}
                        <section className="mb-8">
                            <div className="flex items-center space-x-2 mb-4">
                                <Database className="w-6 h-6 text-blue-600" />
                                <h2 className="text-2xl font-semibold text-gray-900">Collecte des Données</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Données collectées automatiquement :</h3>
                                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                                        <li>Adresse IP et informations de connexion</li>
                                        <li>Type de navigateur et système d'exploitation</li>
                                        <li>Pages visitées et temps passé sur le site</li>
                                        <li>Statistiques d'utilisation anonymisées</li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Données fournies volontairement :</h3>
                                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                                        <li>Numéro d'identification nationale (NNI) pour la recherche</li>
                                        <li>Numéro de dossier d'examen</li>
                                        <li>Informations de contact (formulaire de contact)</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Utilisation des données */}
                        <section className="mb-8">
                            <div className="flex items-center space-x-2 mb-4">
                                <UserCheck className="w-6 h-6 text-purple-600" />
                                <h2 className="text-2xl font-semibold text-gray-900">Utilisation des Données</h2>
                            </div>
                            <p className="text-gray-700 mb-4">Nous utilisons vos données uniquement pour :</p>
                            <ul className="list-disc list-inside text-gray-700 space-y-2">
                                <li>Fournir l'accès aux résultats d'examens</li>
                                <li>Améliorer la performance et la sécurité du site</li>
                                <li>Répondre à vos demandes de support</li>
                                <li>Générer des statistiques anonymisées</li>
                                <li>Respecter nos obligations légales</li>
                            </ul>
                        </section>

                        {/* Protection des données */}
                        <section className="mb-8">
                            <div className="flex items-center space-x-2 mb-4">
                                <Lock className="w-6 h-6 text-red-600" />
                                <h2 className="text-2xl font-semibold text-gray-900">Protection des Données</h2>
                            </div>
                            <div className="space-y-4 text-gray-700">
                                <p>
                                    Nous mettons en place des mesures de sécurité techniques et organisationnelles 
                                    appropriées pour protéger vos données personnelles contre :
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>L'accès non autorisé</li>
                                    <li>La divulgation accidentelle</li>
                                    <li>La modification ou la destruction illicite</li>
                                    <li>La perte accidentelle</li>
                                </ul>
                                <p>
                                    Toutes les communications sont chiffrées via HTTPS et les données sensibles 
                                    sont stockées de manière sécurisée.
                                </p>
                            </div>
                        </section>

                        {/* Vos droits */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Vos Droits</h2>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-gray-700 mb-3">Vous disposez des droits suivants concernant vos données personnelles :</p>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    <li><strong>Droit d'accès :</strong> Connaître les données que nous détenons sur vous</li>
                                    <li><strong>Droit de rectification :</strong> Corriger les données inexactes</li>
                                    <li><strong>Droit d'effacement :</strong> Demander la suppression de vos données</li>
                                    <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
                                </ul>
                            </div>
                        </section>

                        {/* Cookies */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies</h2>
                            <p className="text-gray-700 mb-4">
                                Nous utilisons des cookies essentiels pour le fonctionnement du site. 
                                Ces cookies ne collectent aucune information personnelle identifiable.
                            </p>
                        </section>

                        {/* Contact */}
                        <section className="bg-gray-50 rounded-lg p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
                            <p className="text-gray-700 mb-4">
                                Pour toute question concernant cette politique de confidentialité ou 
                                pour exercer vos droits, contactez-nous :
                            </p>
                            <div className="text-gray-700">
                                <p><strong>Email :</strong> ahmed@ahmed78.me</p>
                                <p><strong>Téléphone :</strong> +222 20087182</p>
                                <p><strong>Adresse :</strong> Arafat, Nouakchott, Mauritanie</p>
                            </div>
                        </section>

                    </div>
                </div>
            </main>
        </div>
    );
}