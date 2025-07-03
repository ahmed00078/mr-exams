'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, BarChart3, Home } from 'lucide-react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navigationItems = [
        { href: '/', label: 'Accueil', icon: Home },
        { href: '/stats', label: 'Statistiques', icon: BarChart3 },
    ];

    // Fonction pour vérifier si un lien est actif
    const isActiveLink = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    return (
        <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo et titre */}
                    <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <div className="mauritania-flag w-8 h-6"></div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">
                                Résultats d'Examens
                            </h1>
                            <p className="text-xs text-gray-600 leading-tight">
                                République Islamique de Mauritanie
                            </p>
                        </div>
                    </Link>

                    {/* Navigation desktop */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = isActiveLink(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bouton de recherche rapide */}
                    <div className="hidden md:flex items-center">
                        <Link
                            href="/"
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            <Search className="w-4 h-4" />
                            <span>Rechercher</span>
                        </Link>
                    </div>

                    {/* Bouton menu mobile */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Menu mobile */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <nav className="space-y-1">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = isActiveLink(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center space-x-3 px-3 py-3 rounded-lg font-medium transition-all duration-200 ${isActive
                                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}

                            {/* Séparateur */}
                            <div className="border-t border-gray-200 my-3"></div>

                            {/* Bouton de recherche mobile */}
                            <Link
                                href="/"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center space-x-3 bg-blue-600 text-white px-3 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                <Search className="w-5 h-5" />
                                <span>Rechercher un résultat</span>
                            </Link>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}