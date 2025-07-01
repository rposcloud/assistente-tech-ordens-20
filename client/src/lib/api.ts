const API_BASE = '/api';

// Função para obter o token de autenticação
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Função helper para fazer requisições autenticadas
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro na requisição');
  }

  return response.json();
};

// HTTP methods diretos
const httpMethods = {
  get: (endpoint: string) => apiRequest(endpoint),
  post: (endpoint: string, data: any) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: any) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' }),
};

// Cliente API
export const api = {
  // HTTP methods diretos
  ...httpMethods,
  // Clientes
  clientes: {
    list: () => apiRequest('/clientes'),
    create: (data: any) => apiRequest('/clientes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/clientes/${id}`, { method: 'DELETE' }),
  },

  // Produtos
  produtos: {
    list: () => apiRequest('/produtos'),
    create: (data: any) => apiRequest('/produtos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/produtos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/produtos/${id}`, { method: 'DELETE' }),
  },

  // Ordens de Serviço
  ordens: {
    list: () => apiRequest('/ordens'),
    create: (data: any) => apiRequest('/ordens', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/ordens/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/ordens/${id}`, { method: 'DELETE' }),
  },

  // Financeiro
  financeiro: {
    list: () => apiRequest('/financeiro'),
    create: (data: any) => apiRequest('/financeiro', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/financeiro/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/financeiro/${id}`, { method: 'DELETE' }),
  },

  // Categorias Financeiras
  categoriasFinanceiras: {
    list: () => apiRequest('/categorias-financeiras'),
  },

  // Tipos de Defeito
  tiposDefeito: {
    list: () => apiRequest('/tipos-defeito'),
  },

  // Portal
  portal: {
    getByToken: (token: string) => fetch(`${API_BASE}/portal/${token}`).then(res => res.json()),
  },
};

export { apiRequest };
export default api;