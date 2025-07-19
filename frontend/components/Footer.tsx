export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Informations officielles */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="flex items-center">
                                <img
                                    src="/logo.png"
                                    alt="Logo"
                                    className="h-8 w-auto mr-3"
                                />
                            </div>
                            <h3 className="text-lg font-bold">La plateforme d’examens de référence en Mauritanie</h3>
                        </div>
                        <p className="text-gray-300 mb-4">
                            La plateforme d’examens de référence en Mauritanie.
                            Consultez vos résultats du BAC, BEPC et autres concours en toute sécurité.
                        </p>
                        <p className="text-sm text-gray-400">
                            NatijtiMR
                        </p>
                    </div>

                    {/* Liens utiles */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Examens</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li>
                                <a href="/" className="hover:text-white transition-colors duration-200">
                                    Baccalauréat (BAC)
                                </a>
                            </li>
                            <li>
                                <a href="/" className="hover:text-white transition-colors duration-200">
                                    BEPC
                                </a>
                            </li>
                            <li>
                                <a href="/" className="hover:text-white transition-colors duration-200">
                                    Concours d&apos;entrée
                                </a>
                            </li>
                            <li>
                                <a href="/stats" className="hover:text-white transition-colors duration-200">
                                    Statistiques
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li>
                                <a href="/how-to-search" className="hover:text-white transition-colors duration-200">
                                    Comment rechercher
                                </a>
                            </li>
                            <li>
                                <a href="/faq" className="hover:text-white transition-colors duration-200">
                                    FAQ
                                </a>
                            </li>
                            <li>
                                <a href="/contact" className="hover:text-white transition-colors duration-200">
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a href="/report" className="hover:text-white transition-colors duration-200">
                                    Signaler un problème
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm">
                        © 2024 La plateforme d’examens de référence en Mauritanie. Tous droits réservés.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                            Politique de confidentialité
                        </a>
                        <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                            Conditions d&apos;utilisation
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
  }