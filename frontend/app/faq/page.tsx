'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, HelpCircle, ChevronDown, Clock, Shield, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function FAQPage() {
    const router = useRouter();
    const [openQuestion, setOpenQuestion] = useState<number | null>(null);

    const faqs = [
        {
            question: "Quand les résultats sont-ils publiés ?",
            answer: "Les résultats sont publiés dès leur validation officielle par le Ministère. Vous serez notifié via les canaux officiels.",
            icon: <Clock className="w-5 h-5 text-blue-600" />
        },
        {
            question: "Je ne trouve pas mes résultats, que faire ?",
            answer: "Vérifiez l'orthographe de votre nom et votre NNI. Si le problème persiste, contactez votre établissement ou utilisez le formulaire de signalement.",
            icon: <AlertCircle className="w-5 h-5 text-yellow-600" />
        },
        {
            question: "Mes données sont-elles sécurisées ?",
            answer: "Oui, toutes vos données sont protégées et chiffrées. Nous respectons strictement la confidentialité de vos informations personnelles.",
            icon: <Shield className="w-5 h-5 text-green-600" />
        },
        {
            question: "Puis-je consulter les résultats d'un autre candidat ?",
            answer: "Non, vous ne pouvez consulter que vos propres résultats. Chaque candidat doit utiliser ses propres informations d'identification.",
            icon: <Shield className="w-5 h-5 text-red-600" />
        },
        {
            question: "Comment partager mes résultats ?",
            answer: "Utilisez le bouton de partage disponible sur votre page de résultats. Un lien sécurisé sera généré pour partager vos résultats.",
            icon: <HelpCircle className="w-5 h-5 text-purple-600" />
        },
        {
            question: "Le site ne fonctionne pas, que faire ?",
            answer: "Vérifiez votre connexion internet, videz le cache de votre navigateur, ou essayez avec un autre navigateur. Si le problème persiste, signalez-le.",
            icon: <AlertCircle className="w-5 h-5 text-orange-600" />
        }
    ];

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
                        <HelpCircle className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Questions Fréquentes
                        </h1>
                    </div>
                    
                    <p className="text-gray-600 text-lg">
                        Trouvez rapidement les réponses à vos questions
                    </p>
                </div>

                {/* FAQ List */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg">
                                <button
                                    onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        {faq.icon}
                                        <span className="font-medium text-gray-900">{faq.question}</span>
                                    </div>
                                    <ChevronDown 
                                        className={`w-5 h-5 text-gray-500 transition-transform ${
                                            openQuestion === index ? 'rotate-180' : ''
                                        }`} 
                                    />
                                </button>
                                {openQuestion === index && (
                                    <div className="px-6 pb-4 pt-2">
                                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Contact */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Besoin d'aide supplémentaire ?</h3>
                        <p className="text-gray-700 mb-4">
                            Si vous ne trouvez pas la réponse à votre question, n'hésitez pas à nous contacter.
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                            <a href="/contact" className="btn-primary text-center">
                                Nous contacter
                            </a>
                            <a href="/report" className="btn-secondary text-center">
                                Signaler un problème
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}