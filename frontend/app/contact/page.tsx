'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, Mail, MessageCircle, Send, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simuler l'envoi
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Message envoyé avec succès !');
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - Style TailAdmin */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-3 md:px-4 py-3 md:py-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/')}
                            className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                        </Button>
                        
                        <div className="flex items-center space-x-3 flex-1">
                            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center">
                                <MessageCircle className="w-4 h-4 md:w-6 md:h-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                                    Contact & Support
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-6xl">
                {/* Informations de contact - Style TailAdmin Mobile-First */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-200 p-4 md:p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <h2 className="text-base md:text-lg font-bold text-gray-900">
                            Informations de contact
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-blue-900">Adresse</h3>
                                <p className="text-xs text-blue-700 leading-tight">
                                    Arafat, Nouakchott, Mauritanie
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Phone className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-green-900">Téléphone</h3>
                                <p className="text-xs text-green-700 font-mono">
                                    +222 20087182
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Mail className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-purple-900">Email</h3>
                                <p className="text-xs text-purple-700 truncate">
                                    ahmed@ahmed78.me
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulaire de contact - Style TailAdmin Mobile-First */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-200 p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                            <Send className="w-4 h-4 text-green-600" />
                        </div>
                        <h2 className="text-base md:text-lg font-bold text-gray-900">
                            Envoyez-nous un message
                        </h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="prenom" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    id="prenom"
                                    name="prenom"
                                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm md:text-base"
                                    placeholder="Votre prénom"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="nom" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    id="nom"
                                    name="nom"
                                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm md:text-base"
                                    placeholder="Votre nom"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="email" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm md:text-base"
                                placeholder="votre@email.com"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="sujet" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                Sujet
                            </label>
                            <select
                                id="sujet"
                                name="sujet"
                                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm md:text-base"
                                required
                            >
                                <option value="">Sélectionnez un sujet</option>
                                <option value="recherche">Problème de recherche</option>
                                <option value="resultats">Résultats incorrects</option>
                                <option value="technique">Problème technique</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="message" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-y text-sm md:text-base"
                                placeholder="Décrivez votre problème ou votre question..."
                                required
                            ></textarea>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Envoyer le message
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}