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
  return `${num.toFixed(2)}%`;
}

export function formatNNI(nni: string): string {
  return nni.replace(/(\d{10})(\d{2})/, '$1-$2');
}

export function formatDate(date: string): string {
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
  switch (decision.toLowerCase()) {
    case 'admis':
      return 'bg-green-100 text-green-800';
    case 'refusé':
    case 'refuse':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getMentionColor(mention: string): string {
  switch (mention.toLowerCase()) {
    case 'très bien':
      return 'text-green-600';
    case 'bien':
      return 'text-blue-600';
    case 'assez bien':
      return 'text-yellow-600';
    case 'passable':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
}

export function generateShareUrl(resultId: string): string {
  return `${window.location.origin}/result/${resultId}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

export function validateNNI(nni: string): boolean {
  // Enlever les espaces et tirets
  const cleanNNI = nni.replace(/[\s-]/g, '');
  // Vérifier que c'est uniquement des chiffres et entre 10 et 20 caractères
  return /^\d{10,20}$/.test(cleanNNI);
}
