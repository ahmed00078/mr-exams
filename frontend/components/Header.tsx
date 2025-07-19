'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    Menu,
    Search,
    BarChart3,
    Home,
    GraduationCap,
    Shield
} from 'lucide-react';

export default function Header() {
    const [searchTerm, setSearchTerm] = useState('');
    const pathname = usePathname();
    const router = useRouter();

    const navigationItems = [
        { href: '/', label: 'Accueil', icon: Home },
    ];

    // Fonction pour vérifier si un lien est actif
    const isActiveLink = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    // Gestion de la recherche rapide
    const handleQuickSearch = () => {
        if (searchTerm.trim()) {
            router.push(`/search?nom=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">

                    {/* Logo et titre */}
                    <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <div className="flex items-center">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="h-8 w-auto mr-3"
                            />
                            {/* <span className="font-bold">Nom du site</span> */}
                        </div>
                        {/* <div className="hidden sm:flex flex-col">
                            <h1 className="text-lg font-bold text-foreground leading-tight">
                                Résultats d'Examens
                            </h1>
                            <p className="text-xs text-muted-foreground leading-tight">
                                La plateforme d’examens de référence en Mauritanie
                            </p>
                        </div>
                        <div className="sm:hidden">
                            <h1 className="text-base font-bold text-foreground">
                                Examens MR
                            </h1>
                        </div> */}
                    </Link>

                    {/* Navigation desktop */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = isActiveLink(item.href);

                            return (
                                <Button
                                    key={item.href}
                                    asChild
                                    variant={isActive ? "default" : "ghost"}
                                    className="h-9"
                                >
                                    <Link href={item.href}>
                                        <Icon className="w-4 h-4 mr-2" />
                                        {item.label}
                                    </Link>
                                </Button>
                            );
                        })}

                    </nav>

                    {/* Recherche rapide desktop */}
                    <div className="hidden lg:flex items-center space-x-2 max-w-sm">
                        <div className="relative flex-1">
                            <Input
                                placeholder="Rechercher un candidat..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
                                className="h-9 pr-9"
                            />
                            <Button
                                size="sm"
                                onClick={handleQuickSearch}
                                disabled={!searchTerm.trim()}
                                className="absolute right-1 top-1 h-7 w-7 p-0"
                            >
                                <Search className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Bouton de recherche mobile */}
                    <div className="flex items-center space-x-2 lg:hidden">
                        <Button
                            asChild
                            size="sm"
                            variant="outline"
                        >
                            <Link href="/">
                                <Search className="w-4 h-4" />
                            </Link>
                        </Button>

                        {/* Menu mobile */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="sm" className="md:hidden">
                                    <Menu className="w-5 h-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-80">
                                <div className="flex flex-col space-y-4 mt-8">
                                    {/* Logo dans le menu mobile */}
                                    <div className="flex items-center space-x-3 pb-4">
                                        <div className="mauritania-flag w-8 h-6 rounded-sm"></div>
                                        <div>
                                            <h2 className="text-lg font-bold text-foreground">
                                                Examens Mauritanie
                                            </h2>
                                            <p className="text-xs text-muted-foreground">
                                                Portail officiel
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Recherche mobile */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-medium text-foreground">Recherche rapide</h3>
                                        <div className="flex space-x-2">
                                            <Input
                                                placeholder="Nom du candidat..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
                                            />
                                            <Button
                                                onClick={handleQuickSearch}
                                                disabled={!searchTerm.trim()}
                                                size="sm"
                                            >
                                                <Search className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Navigation mobile */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-medium text-foreground">Navigation</h3>
                                        <nav className="space-y-2">
                                            {navigationItems.map((item) => {
                                                const Icon = item.icon;
                                                const isActive = isActiveLink(item.href);

                                                return (
                                                    <Button
                                                        key={item.href}
                                                        asChild
                                                        variant={isActive ? "default" : "ghost"}
                                                        className="w-full justify-start h-10"
                                                    >
                                                        <Link href={item.href}>
                                                            <Icon className="w-4 h-4 mr-3" />
                                                            {item.label}
                                                        </Link>
                                                    </Button>
                                                );
                                            })}

                                            {/* Admin mobile */}
                                            {process.env.NODE_ENV === 'development' && (
                                                    <Button
                                                        asChild
                                                        variant={pathname === '/admin' ? "default" : "ghost"}
                                                        className="w-full justify-start h-10"
                                                    >
                                                        <Link href="/admin">
                                                            <Shield className="w-4 h-4 mr-3" />
                                                            Administration
                                                        </Link>
                                                    </Button>
                                                )}
                                        </nav>
                                    </div>

                                    <Separator />

                                    {/* Raccourcis mobiles */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-medium text-foreground">Raccourcis</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="h-16 flex-col space-y-2"
                                            >
                                                <Link href="/">
                                                    <GraduationCap className="w-6 h-6" />
                                                    <span className="text-xs">BAC</span>
                                                </Link>
                                            </Button>

                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="h-16 flex-col space-y-2"
                                            >
                                                <Link href="/">
                                                    <GraduationCap className="w-6 h-6" />
                                                    <span className="text-xs">BEPC</span>
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Informations */}
                                    <div className="space-y-2 text-center text-xs text-muted-foreground">
                                        <p>La plateforme d’examens de référence en Mauritanie</p>
                                        <p>Ministère de l'Éducation Nationale</p>
                                        <p className="font-medium">Portail Officiel des Résultats</p>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}