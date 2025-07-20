// Types de base
export interface Wilaya {
    id: number;
    code: string;
    name_fr: string;
    name_ar: string;
    name_en?: string;
    created_at: string;
}

export interface Etablissement {
    id: number;
    code: string;
    name_fr: string;
    name_ar: string;
    type_etablissement: string;
    wilaya_id: number;
    phone?: string;
    email?: string;
    status: string;
    wilaya?: Wilaya;
}

export interface Serie {
    id: number;
    code: string;
    name_fr: string;
    name_ar: string;
    exam_type: string;
}

export interface Session {
    id: number;
    year: number;
    exam_type: string;
    session_name: string;
    start_date?: string;
    end_date?: string;
    publication_date?: string;
    is_published: boolean;
    total_candidates: number;
    total_passed: number;
    pass_rate?: number;
}

// Types pour les résultats d'examen
export interface ExamResult {
    id: string;
    session_id: number;
    nni: string;
    numero_dossier?: string;
    nom_complet_fr: string;
    nom_complet_ar?: string;
    lieu_naissance?: string;
    date_naissance?: string;
    sexe?: 'M' | 'F';
    moyenne_generale?: number;
    total_points?: number;  // Pour les concours (note sur 200)
    decision: string;
    mention?: string;
    rang_etablissement?: number;
    rang_wilaya?: number;
    rang_national?: number;
    is_published: boolean;
    view_count: number;
    created_at: string;
    etablissement?: Etablissement;
    etablissement_name?: string;
    serie?: Serie;
    serie_code?: string;
    wilaya?: Wilaya;
    wilaya_name?: string;
    session?: Session;  // Ajout des données de session
}

export interface ExamResultDetail extends ExamResult {
    nom_pere?: string;
    type_candidat: string;
    centre_examen?: string;
    total_points?: number;
    published_at?: string;
}

// Types pour la recherche
export interface SearchParams {
    nni?: string;
    numero_dossier?: string;
    nom?: string;
    wilaya_id?: number;
    etablissement_id?: number;
    serie_id?: number;
    serie_code?: string;
    decision?: string;
    year?: number;
    exam_type?: string;
    page: number;
    size: number;
}

export interface SearchResponse {
    results: ExamResult[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

// Types pour le partage social
export interface SocialShareCreate {
    result_id: string;
    platform: 'facebook' | 'twitter' | 'whatsapp' | 'telegram' | 'linkedin';
    is_anonymous: boolean;
}

export interface SocialShareResponse {
    share_token: string;
    share_url: string;
    expires_at: string;
}

export interface SocialSharePublic {
    candidate_name: string;
    exam_type: string;
    decision: string;
    moyenne?: number;
    etablissement?: string;
    wilaya?: string;
    year: number;
    is_anonymous: boolean;
}

// Types pour les statistiques
export interface StatsEtablissement {
    etablissement_id: number;
    etablissement_name: string;
    total_candidats: number;
    total_admis: number;
    taux_reussite: number;
    moyenne_etablissement?: number;
    rang_wilaya?: number;
}

export interface StatsWilaya {
    wilaya_id: number;
    wilaya_name: string;
    total_candidats: number;
    total_admis: number;
    taux_reussite: number;
    moyenne_wilaya?: number;
    rang_national?: number;
    stats_par_serie: Record<string, any>;
}

// Types pour l'authentification
export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    can_publish_results: boolean;
    can_manage_users: boolean;
    last_login?: string;
}

export interface Token {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: User;
}

// Types pour l'upload
export interface BulkUploadResponse {
    task_id: string;
    message: string;
    total_rows: number;
}

export interface BulkUploadStatus {
    task_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    total_rows: number;
    processed_rows: number;
    success_count: number;
    error_count: number;
    errors: string[];
}