import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTauxReussite(taux: number | null | undefined): string {
  if (taux === null || taux === undefined) {
    return 'N/A';
  }
  const num = typeof taux === 'string' ? parseFloat(taux) : taux;
  if (isNaN(num)) {
    return 'N/A';
  }
  return `${num.toFixed(1)}%`;
}

export function formatNNI(nni: string): string {
  if (!nni) return '';
  return nni.replace(/(\d{4})(\d{4})(\d{2})/, '$1 $2 $3');
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR');
}

export function formatMoyenne(moyenne: number | null | undefined): string {
  if (moyenne === null || moyenne === undefined) {
    return 'N/A';
  }
  const num = typeof moyenne === 'string' ? parseFloat(moyenne) : moyenne;
  if (isNaN(num)) {
    return 'N/A';
  }
  return `${num.toFixed(2)}/20`;
}

export function getDecisionBadgeColor(decision: string): string {
  const d = decision.toLowerCase();
  if (d.includes('admis')) {
    return 'bg-green-100 text-green-800 border-green-300';
  }
  if (d.includes('ajourné') || d.includes('ajourne') || d.includes('refusé') || d.includes('refuse')) {
    return 'bg-red-100 text-red-800 border-red-300';
  }
  if (d.includes('passable')) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  }
  return 'bg-gray-100 text-gray-800 border-gray-300';
}

export function getMentionColor(mention: string): string {
  const m = mention.toLowerCase();
  if (m.includes('très bien') || m.includes('tres bien')) {
    return 'text-green-600';
  }
  if (m.includes('bien')) {
    return 'text-blue-600';
  }
  if (m.includes('assez bien')) {
    return 'text-yellow-600';
  }
  if (m.includes('passable')) {
    return 'text-orange-600';
  }
  return 'text-gray-600';
}

export function generateShareUrl(platform: string, url: string, text: string): string {
  const encodedUrl = encodeURIComponent(url);
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
      return url;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback pour les navigateurs plus anciens
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Failed to copy to clipboard:', fallbackError);
      return false;
    }
  }
}

export function validateNNI(nni: string): boolean {
  if (!nni) return false;
  // Enlever les espaces et tirets
  const cleanNNI = nni.replace(/[\s-]/g, '');
  // Vérifier que c'est uniquement des chiffres et entre 10 et 20 caractères
  return /^\d{10,20}$/.test(cleanNNI);
}

export function getExamTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'bac': 'Baccalauréat',
    'bepc': 'BEPC',
    'concours': 'Concours'
  };
  return labels[type?.toLowerCase()] || type?.toUpperCase() || '';
}

export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInMs = now.getTime() - then.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Aujourd'hui";
  if (diffInDays === 1) return "Hier";
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
  if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`;
  return `Il y a ${Math.floor(diffInDays / 365)} ans`;
}