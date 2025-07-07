import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Portail des Résultats d\'Examens - Mauritanie',
    description: 'Consultez vos résultats d\'examens mauritaniens en ligne - BAC, BEPC, Concours',
    keywords: 'résultats, examens, mauritanie, bac, bepc, concours, nni',
    authors: [{ name: 'La plateforme d’examens de référence en Mauritanie' }],
    viewport: 'width=device-width, initial-scale=1',
    robots: 'index, follow',
    openGraph: {
        title: 'Portail des Résultats d\'Examens - Mauritanie',
        description: 'Consultez vos résultats d\'examens mauritaniens en ligne',
        type: 'website',
        locale: 'fr_FR',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr" className="scroll-smooth">
            <body className={`${inter.className} min-h-screen bg-gray-50 flex flex-col`}>
                <Header />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}