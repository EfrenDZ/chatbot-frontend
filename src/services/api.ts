const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const getHeaders = () => {
  const token = localStorage.getItem('zabotek_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const ApiService = {
  login: async (email: string, password: string, chatwootApiUrl: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, chatwootApiUrl }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Credenciales inválidas');
    }

    return response.json(); // { token, user }
  },

  getMetrics: async (accountId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/config/${accountId}/metrics`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener las métricas');
    }

    return response.json();
  },

  getBotConfig: async (accountId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/config/${accountId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('zabotek_auth_token');
      throw new Error('No autorizado');
    }

    if (!response.ok) {
      throw new Error('Error al obtener la configuración del bot');
    }

    return response.json();
  },

  updateBotConfig: async (accountId: number, data: any) => {
    // Es POST o PUT? En backend es POST para crear/actualizar
    const response = await fetch(`${API_BASE_URL}/api/config/${accountId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la configuración');
    }

    return response.json();
  },
};
