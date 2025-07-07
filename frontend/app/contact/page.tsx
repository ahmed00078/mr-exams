export default function ContactPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Contactez-nous
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Nous sommes là pour vous aider. N'hésitez pas à nous contacter pour toute question ou assistance.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Informations de contact */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl p-8 h-fit">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Informations de contact
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Adresse</h3>
                                        <p className="text-gray-600">
                                            Arafat, Nouakchott, Mauritanie
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Téléphone</h3>
                                        <p className="text-gray-600">
                                            +222 20087182
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="bg-red-100 p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                                        <p className="text-gray-600">
                                            ahmed@ahmed78.me
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire de contact */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Envoyez-nous un message
                            </h2>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                                            Prénom
                                        </label>
                                        <input
                                            type="text"
                                            id="prenom"
                                            name="prenom"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                            placeholder="Votre prénom"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom
                                        </label>
                                        <input
                                            type="text"
                                            id="nom"
                                            name="nom"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                            placeholder="Votre nom"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="votre@email.com"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="sujet" className="block text-sm font-medium text-gray-700 mb-2">
                                        Sujet
                                    </label>
                                    <select
                                        id="sujet"
                                        name="sujet"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-y"
                                        placeholder="Décrivez votre problème ou votre question..."
                                        required
                                    ></textarea>
                                </div>
                                
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none"
                                >
                                    Envoyer le message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}