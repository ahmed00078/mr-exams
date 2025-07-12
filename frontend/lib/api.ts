import {
    SearchParams,
    SearchResponse,
    ExamResult,
    ExamResultDetail,
    Wilaya,
    Etablissement,
    Serie,
    Session,
    SocialShareCreate,
    SocialShareResponse,
    SocialSharePublic,
    StatsWilaya,
    StatsEtablissement,
    Token,
    BulkUploadResponse,
    BulkUploadStatus
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const url = `${baseUrl}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        return await response.text();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// API functions pour les résultats
export const resultsApi = {
    search: async (params: SearchParams): Promise<SearchResponse> => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, value.toString());
            }
        });

        return fetchApi(`/results/search?${query.toString()}`);
    },

    getById: async (id: string): Promise<ExamResultDetail> => {
        return fetchApi(`/results/${id}`);
    },

    createShare: async (data: SocialShareCreate): Promise<SocialShareResponse> => {
        return fetchApi(`/results/${data.result_id}/share`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

// API functions pour les références
export const referencesApi = {
    getWilayas: async (): Promise<Wilaya[]> => {
        return fetchApi('/references/wilayas');
    },

    getEtablissements: async (wilaya_id?: number): Promise<Etablissement[]> => {
        const query = wilaya_id ? `?wilaya_id=${wilaya_id}` : '';
        return fetchApi(`/references/etablissements${query}`);
    },

    getSeries: async (exam_type?: string): Promise<Serie[]> => {
        const query = exam_type ? `?exam_type=${exam_type}` : '';
        return fetchApi(`/references/series${query}`);
    },
};

// API functions pour les sessions
export const sessionsApi = {
    getPublished: async (exam_type?: string, year?: number): Promise<Session[]> => {
        const query = new URLSearchParams();
        if (exam_type) query.append('exam_type', exam_type);
        if (year) query.append('year', year.toString());

        return fetchApi(`/sessions/?${query.toString()}`);
    },

    getCurrent: async (exam_type: string): Promise<Session> => {
        return fetchApi(`/sessions/current/?exam_type=${exam_type}`);
    },
};

// API functions pour les statistiques
export const statsApi = {
    getWilayaStats: async (wilaya_id: number, year: number, exam_type: string): Promise<StatsWilaya> => {
        return fetchApi(`/stats/wilaya/${wilaya_id}?year=${year}&exam_type=${exam_type}`);
    },

    getEtablissementStats: async (etablissement_id: number, year: number, exam_type: string): Promise<StatsEtablissement> => {
        return fetchApi(`/stats/etablissement/${etablissement_id}?year=${year}&exam_type=${exam_type}`);
    },

    getGlobalStats: async (year: number, exam_type: string): Promise<any> => {
        return fetchApi(`/stats/global?year=${year}&exam_type=${exam_type}`);
    },

    getTopStudents: async (year: number, exam_type: string, limit: number = 10): Promise<any> => {
        return fetchApi(`/stats/top-students?year=${year}&exam_type=${exam_type}&limit=${limit}`);
    },

    getTopSchools: async (year: number, exam_type: string, limit: number = 10): Promise<any> => {
        return fetchApi(`/stats/top-schools?year=${year}&exam_type=${exam_type}&limit=${limit}`);
    },
};

// API functions pour le partage social
export const socialApi = {
    getShareData: async (token: string): Promise<SocialSharePublic> => {
        return fetchApi(`/share/${token}/data/`);
    },
};

// API functions pour l'authentification
export const authApi = {
    login: async (username: string, password: string): Promise<Token> => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        return fetchApi('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });
    },

    getProfile: async (token: string): Promise<any> => {
        return fetchApi('/auth/me/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
};

// API functions pour l'administration
export const adminApi = {
    uploadResults: async (file: File, session_id: number, token: string): Promise<BulkUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('session_id', session_id.toString());

        const response = await fetch(`${API_BASE_URL}/admin/upload/`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                // Ne pas définir Content-Type pour FormData - le navigateur le fait automatiquement
            },
            body: formData,
        });

        if (!response.ok) {
            throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    },

    getUploadStatus: async (task_id: string, token: string): Promise<BulkUploadStatus> => {
        return fetchApi(`/admin/upload/${task_id}/status/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },

    createSession: async (data: { 
        year: number; 
        exam_type: string; 
        session_name: string;
        start_date?: string;
        end_date?: string;
        publication_date?: string;
        is_published?: boolean;
        is_archived?: boolean;
    }, token: string): Promise<Session> => {
        const formData = new URLSearchParams();
        formData.append('year', data.year.toString());
        formData.append('exam_type', data.exam_type);
        formData.append('session_name', data.session_name);
        
        if (data.start_date) formData.append('start_date', data.start_date);
        if (data.end_date) formData.append('end_date', data.end_date);
        if (data.publication_date) formData.append('publication_date', data.publication_date);
        if (data.is_published !== undefined) formData.append('is_published', data.is_published.toString());
        if (data.is_archived !== undefined) formData.append('is_archived', data.is_archived.toString());

        return fetchApi('/admin/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${token}`,
            },
            body: formData.toString(),
        });
    },

    getAllSessions: async (token: string): Promise<Session[]> => {
        return fetchApi('/admin/sessions', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },

    toggleSessionPublication: async (sessionId: number, isPublished: boolean, token: string): Promise<{ message: string; session: Session }> => {
        const formData = new URLSearchParams();
        formData.append('is_published', isPublished.toString());

        return fetchApi(`/admin/sessions/${sessionId}/publish`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${token}`,
            },
            body: formData.toString(),
        });
    },
};