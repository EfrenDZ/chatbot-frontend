const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Cliente HTTP para comunicarse con el Backend del Bot SaaS.
 */
export const ApiService = {

  getMetrics: async (accountId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/config/${accountId}/metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener las métricas');
    }

    return response.json();
  },

  /**
   * Obtiene la configuración completa del bot para la cuenta actual.
   */
  getBotConfig: async (accountId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/config/${accountId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Aquí enviaríamos un token firmado si implementamos SSO con Chatwoot
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener la configuración del bot');
    }

    return response.json();
  },

  /**
   * Actualiza la configuración del bot (Modo IA, Prompts, JSON del menú).
   */
  updateBotConfig: async (accountId: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/config/${accountId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la configuración');
    }

    return response.json();
  },
};
