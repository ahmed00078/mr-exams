'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { referencesApi } from '@/lib/api';
import { Wilaya, Etablissement, Serie } from '@/types';
import { validateNNI } from '@/lib/utils';

interface SearchFormProps {
    initialValues?: {
        nni?: string;
        nom?: string;
        wilaya_id?: number;
        etablissement_id?: number;
        serie_id?: number;
        year?: number;
        exam_type?: string;
    };
    onSearch?: (params: any) => void;
    showAdvanced?: boolean;
}

export default function SearchForm({
    initialValues = {},
    onSearch,
    showAdvanced = true
}: SearchFormProps) {
    const router = useRouter();

    // États du formulaire
    const [formData, setFormData] = useState({
        nni: initialValues.nni || '',
        nom: initialValues.nom || '',
        wilaya_id: initialValues.wilaya_id || '',
        etablissement_id: initialValues.etablissement_id || '',
        serie_id: initialValues.serie_id || '',
        year: initialValues.year || new Date().getFullYear(),
        exam_type: initialValues.exam_type || 'bac',
    });

    // États des données de référence
    const [wilayas, setWilayas] = useState<Wilaya[]>([]);
    const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
    const [series, setSeries] = useState<Serie[]>([]);

    // États UI
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Charger les données de référence
    useEffect(() => {
        const loadReferences = async () => {
            try {
                const [wilayasData, seriesData] = await Promise.all([
                    referencesApi.getWilayas(),
                    referencesApi.getSeries()
                ]);

                setWilayas(wilayasData);
                setSeries(seriesData);
            } catch (error) {
                console.error('Erreur lors du chargement des références:', error);
            }
        };

        loadReferences();
    }, []);

    // Charger les établissements quand la wilaya change
    useEffect(() => {
        const loadEtablissements = async () => {
            if (formData.wilaya_id) {
                try {
                    const etablissementsData = await referencesApi.getEtablissements(
                        Number(formData.wilaya_id)
                    );
                    setEtablissements(etablissementsData);
                } catch (error) {
                    console.error('Erreur lors du chargement des établissements:', error);
                }
            } else {
                setEtablissements([]);
                setFormData(prev => ({ ...prev, etablissement_id: '' }));
            }
        };

        loadEtablissements();
    }, [formData.wilaya_id]);

    // Gestion des changements de formulaire
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Effacer l'erreur pour ce champ
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validation du formulaire
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Au moins un critère de recherche requis
        if (!formData.nni && !formData.nom) {
            newErrors.general = 'Veuillez saisir au moins votre NNI ou votre nom';
        }

        // Validation du NNI si fourni
        if (formData.nni && !validateNNI(formData.nni)) {
            newErrors.nni = 'Format de NNI invalide (10 à 20 chiffres)';
        }

        // Validation du nom si fourni
        if (formData.nom && formData.nom.length < 2) {
            newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Construire les paramètres de recherche
            const searchParams = new URLSearchParams();

            Object.entries(formData).forEach(([key, value]) => {
                if (value && value !== '') {
                    searchParams.append(key, value.toString());
                }
            });

            if (onSearch) {
                // Mode composant réutilisable
                onSearch(formData);
            } else {
                // Mode page - redirection vers les résultats
                router.push(`/search?${searchParams.toString()}`);
            }
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            setErrors({ general: 'Une erreur est survenue lors de la recherche' });
        } finally {
            setIsLoading(false);
        }
    };

    // Réinitialiser le formulaire
    const handleReset = () => {
        setFormData({
            nni: '',
            nom: '',
            wilaya_id: '',
            etablissement_id: '',
            serie_id: '',
            year: new Date().getFullYear(),
            exam_type: 'bac',
        });
        setErrors({});
        setShowAdvancedFilters(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Erreur générale */}
            {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{errors.general}</p>
                </div>
            )}

            {/* Champs de recherche principaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NNI */}
                <div>
                    <label htmlFor="nni" className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro National d&apos;Identification (NNI)
                    </label>
                    <input
                        type="text"
                        id="nni"
                        name="nni"
                        value={formData.nni}
                        onChange={handleInputChange}
                        placeholder="Exemple: 1234567890"
                        className={`form-input ${errors.nni ? 'border-red-300 focus:ring-red-500' : ''}`}
                    />
                    {errors.nni && (
                        <p className="mt-1 text-sm text-red-600">{errors.nni}</p>
                    )}
                </div>

                {/* Nom */}
                <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du candidat
                    </label>
                    <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        placeholder="Exemple: Ahmed Mohamed"
                        className={`form-input ${errors.nom ? 'border-red-300 focus:ring-red-500' : ''}`}
                    />
                    {errors.nom && (
                        <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
                    )}
                </div>
            </div>

            {/* Filtres de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Année */}
                <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                        Année
                    </label>
                    <select
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="form-select"
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Type d'examen */}
                <div>
                    <label htmlFor="exam_type" className="block text-sm font-medium text-gray-700 mb-2">
                        Type d&apos;examen
                    </label>
                    <select
                        id="exam_type"
                        name="exam_type"
                        value={formData.exam_type}
                        onChange={handleInputChange}
                        className="form-select"
                    >
                        <option value="bac">Baccalauréat (BAC)</option>
                        <option value="bepc">BEPC</option>
                        <option value="concours">Concours</option>
                    </select>
                </div>
            </div>

            {/* Bouton filtres avancés */}
            {showAdvanced && (
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="flex items-center space-x-2 text-mauritania-primary hover:text-blue-700 font-medium"
                    >
                        <Filter className="w-4 h-4" />
                        <span>
                            {showAdvancedFilters ? 'Masquer' : 'Afficher'} les filtres avancés
                        </span>
                    </button>
                </div>
            )}

            {/* Filtres avancés */}
            {showAdvancedFilters && (
                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Filtres avancés</h3>
                        <button
                            type="button"
                            onClick={() => setShowAdvancedFilters(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Wilaya */}
                        <div>
                            <label htmlFor="wilaya_id" className="block text-sm font-medium text-gray-700 mb-2">
                                Wilaya
                            </label>
                            <select
                                id="wilaya_id"
                                name="wilaya_id"
                                value={formData.wilaya_id}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="">Toutes les wilayas</option>
                                {wilayas.map(wilaya => (
                                    <option key={wilaya.id} value={wilaya.id}>
                                        {wilaya.name_fr}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Établissement */}
                        <div>
                            <label htmlFor="etablissement_id" className="block text-sm font-medium text-gray-700 mb-2">
                                Établissement
                            </label>
                            <select
                                id="etablissement_id"
                                name="etablissement_id"
                                value={formData.etablissement_id}
                                onChange={handleInputChange}
                                className="form-select"
                                disabled={!formData.wilaya_id}
                            >
                                <option value="">Tous les établissements</option>
                                {etablissements.map(etablissement => (
                                    <option key={etablissement.id} value={etablissement.id}>
                                        {etablissement.name_fr}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Série */}
                        <div>
                            <label htmlFor="serie_id" className="block text-sm font-medium text-gray-700 mb-2">
                                Série
                            </label>
                            <select
                                id="serie_id"
                                name="serie_id"
                                value={formData.serie_id}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="">Toutes les séries</option>
                                {series
                                    .filter(serie => serie.exam_type === formData.exam_type)
                                    .map(serie => (
                                        <option key={serie.id} value={serie.id}>
                                            {serie.name_fr} ({serie.code})
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex items-center justify-center space-x-2 min-w-[200px]"
                >
                    <Search className="w-5 h-5" />
                    <span>{isLoading ? 'Recherche...' : 'Rechercher'}</span>
                </button>

                <button
                    type="button"
                    onClick={handleReset}
                    className="btn-secondary flex items-center justify-center space-x-2 min-w-[200px]"
                >
                    <X className="w-5 h-5" />
                    <span>Réinitialiser</span>
                </button>
            </div>
        </form>
    );
}