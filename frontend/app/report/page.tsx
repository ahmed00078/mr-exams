'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Send, Bug, HelpCircle, Database } from 'lucide-react';
import { useState } from 'react';

export default function ReportProblemPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        type: '',
        email: '',
        subject: '',
        description: '',
        nni: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const problemTypes = [
        { value: 'results', label: 'Problème avec mes résultats', icon: <Database className="w-4 h-4" /> },
        { value: 'technical', label: 'Problème technique du site', icon: <Bug className="w-4 h-4" /> },
        { value: 'search', label: 'Impossible de rechercher', icon: <HelpCircle className="w-4 h-4" /> },
        { value: 'other', label: 'Autre problème', icon: <AlertTriangle className="w-4 h-4" /> }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulation d'envoi
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 2000);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50">
                <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Signalement envoyé !</h1>
                        <p className="text-gray-600 mb-6">
                            Merci pour votre signalement. Notre équipe va examiner le problème et vous recontacter si nécessaire.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="btn-primary"
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Signaler un Problème
                        </h1>
                    </div>
                    
                    <p className="text-gray-600 text-lg">
                        Aidez-nous à améliorer la plateforme en signalant les problèmes
                    </p>
                </div>

                {/* Formulaire */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Type de problème */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Type de problème *
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {problemTypes.map((type) => (
                                    <label key={type.value} className="relative cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value={type.value}
                                            checked={formData.type === type.value}
                                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                                            className="sr-only"
                                            required
                                        />
                                        <div className={`border-2 rounded-lg p-4 transition-colors ${
                                            formData.type === type.value 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                            <div className="flex items-center space-x-3">
                                                {type.icon}
                                                <span className="text-sm font-medium text-gray-900">{type.label}</span>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email (optionnel)
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="form-input"
                                placeholder="votre.email@example.com"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Pour vous recontacter si nécessaire
                            </p>
                        </div>

                        {/* NNI (si problème de résultats) */}
                        {formData.type === 'results' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    NNI concerné
                                </label>
                                <input
                                    type="text"
                                    value={formData.nni}
                                    onChange={(e) => setFormData({...formData, nni: e.target.value})}
                                    className="form-input"
                                    placeholder="1234567890"
                                    maxLength={10}
                                />
                            </div>
                        )}

                        {/* Sujet */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Résumé du problème *
                            </label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                className="form-input"
                                placeholder="Décrivez brièvement le problème"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description détaillée *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="form-input h-32 resize-none"
                                placeholder="Décrivez le problème en détail : que s'est-il passé ? Quand ? Que faisiez-vous ?"
                                required
                            />
                        </div>

                        {/* Conseils */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Conseils pour un signalement efficace :</h3>
                            <ul className="text-xs text-blue-800 space-y-1">
                                <li>• Soyez précis sur ce qui ne fonctionne pas</li>
                                <li>• Indiquez votre navigateur (Chrome, Firefox, etc.)</li>
                                <li>• Mentionnez si l'erreur se répète</li>
                            </ul>
                        </div>

                        {/* Boutons */}
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Envoi en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Envoyer le signalement</span>
                                    </>
                                )}
                            </button>
                            <a href="/faq" className="btn-secondary text-center">
                                Consulter la FAQ
                            </a>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}