import axios from 'axios';

const API_BASE_URL = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface FlowPrediction {
  id?: number;
  flow_index: number;
  source_ip: string;
  destination_ip: string;
  prediction: string;
  attack_type: string;
  is_attack: boolean;
  confidence: number;
  timestamp: string;
}

export interface FileUploadResponse {
  file_id: number;
  filename: string;
  total_flows: number;
  attack_count: number;
  normal_count: number;
  uploaded_at: string;
  sample_predictions: FlowPrediction[];
}

export interface PredictionHistoryResponse {
  total: number;
  page: number;
  size: number;
  pages: number;
  records: FlowPrediction[];
}

export interface DashboardStats {
  total_predictions: number;
  total_attacks: number;
  total_normal: number;
  attack_percentage: number;
  model_accuracy: number;
  recent_predictions: FlowPrediction[];
  attack_distribution: Record<string, number>;
  confidence_histogram: Record<string, number>;
  daily_predictions: Array<{
    date: string;
    total: number;
    attacks: number;
    normal: number;
  }>;
}

// API Methods
export const authApi = {
  register: async (data: { email: string; username: string; password: string }) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  login: async (data: { username_or_email: string; password: string }) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const predictionsApi = {
  uploadCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<FileUploadResponse>('/predictions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getDashboardStats: async () => {
    const res = await api.get<DashboardStats>('/predictions/dashboard-stats');
    return res.data;
  },
  getHistory: async (page = 1, size = 20, search?: string, attack_type?: string, is_attack?: boolean) => {
    const params: any = { page, size };
    if (search) params.search = search;
    if (attack_type && attack_type !== 'ALL') params.attack_type = attack_type;
    if (is_attack !== undefined) params.is_attack = is_attack;
    
    const res = await api.get<PredictionHistoryResponse>('/predictions/history', { params });
    return res.data;
  },
  exportReport: async (format: 'csv' | 'xlsx' | 'pdf') => {
    const res = await api.get(`/predictions/export?format=${format}`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `intrusion_report.${format === 'xlsx' ? 'xlsx' : format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
