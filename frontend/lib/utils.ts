import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
}

export function formatShortDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch {
        return dateString;
    }
}

export function formatMoyenne(moyenne?: number): string {
    if (moyenne === undefined || moyenne === null) return 'N/A';
    return `${moyenne.toFixed(2)}/20`;
}

export function getDecisionColor(decision: string): string {
    const normalizedDecision = decision.toLowerCase();

    if (normalizedDecision.includes('admis')) {
        return 'text-mauritania-green';
    }

    if (normalizedDecision.includes('ajourné') || normalizedDecision.includes('ajourne')) {
        return 'text-mauritania-red';
    }

    if (normalizedDecision.includes('passable')) {
        return 'text-mauritania-yellow';
    }

    return 'text-gray-600';
}

export function getDecisionBadgeColor(decision: string): string {
    const normalizedDecision = decision.toLowerCase();

    if (normalizedDecision.includes('admis')) {
        return 'bg-green-100 text-green-800 border-green-200';
    }

    if (normalizedDecision.includes('ajourné') || normalizedDecision.includes('ajourne')) {
        return 'bg-red-100 text-red-800 border-red-200';
    }

    if (normalizedDecision.includes('passable')) {
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }

    return 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getMentionColor(mention?: string): string {
    if (!mention) return 'text-gray-600';

    const normalizedMention = mention.toLowerCase();

    if (normalizedMention.includes('très bien')) {
        return 'text-green-600';
    }

    if (normalizedMention.includes('bien')) {
        return 'text-blue-600';
    }

    if (normalizedMention.includes('assez bien')) {
        return 'text-yellow-600';
    }

    if (normalizedMention.includes('passable')) {
        return 'text-orange-600';
    }

    return 'text-gray-600';
}

export function formatTauxReussite(taux: number): string {
    return `${taux.toFixed(1)}%`;
}

export function validateNNI(nni: string): boolean {
    // NNI mauritanien - généralement 10 à 20 chiffres
    const nniRegex = /^\d{10,20}$/;
    return nniRegex.test(nni.replace(/\s/g, ''));
}

export function formatNNI(nni: string): string {
    // Formater le NNI avec des espaces pour la lisibilité
    const cleaned = nni.replace(/\s/g, '');
    return cleaned.replace(/(\d{4})/g, '$1 ').trim();
}

export function generateShareUrl(platform: string, shareUrl: string, text: string): string {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(text);

    switch (platform) {
        case 'facebook':
            return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

        case 'twitter':
            return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;

        case 'whatsapp':
            return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;

        case 'telegram':
            return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;

        case 'linkedin':
            return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

        default:
            return shareUrl;
    }
}

export function copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback pour les navigateurs plus anciens
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        return new Promise((resolve, reject) => {
            if (document.execCommand('copy')) {
                resolve();
            } else {
                reject(new Error('Échec de la copie'));
            }
            document.body.removeChild(textArea);
        });
    }
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}