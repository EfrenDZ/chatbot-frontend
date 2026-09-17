import { useState, useEffect } from 'react';
import { ApiService } from '../services/api';

interface ChatwootContext {
  accountId: number | null;
  conversationId: number | null;
}

export function useChatwootContext() {
  const [context, setContext] = useState<ChatwootContext>({ accountId: null, conversationId: null });
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigForAccount = async (accountId: number, conversationId: number | null = null) => {
    try {
      setIsLoading(true);
      setContext({ accountId, conversationId });
      const data = await ApiService.getBotConfig(accountId);
      setConfig(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al conectar con la base de datos o inicializar el perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Escuchar eventos postMessage de Chatwoot Dashboard App
    const handleMessage = (event: MessageEvent) => {
      let payload = event.data;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }

      // Chatwoot envía datos de contexto dentro de event.data
      const accountId = payload?.data?.account?.id || payload?.account?.id;
      const conversationId = payload?.data?.conversation?.id || payload?.conversation?.id;

      if (accountId) {
        fetchConfigForAccount(accountId, conversationId);
      }
    };

    window.addEventListener('message', handleMessage);

    // 2. Notificar a Chatwoot que la Dashboard App ya cargó y pedirle los datos
    if (window.parent !== window) {
      window.parent.postMessage('chatwoot-dashboard-app:fetch-info', '*');
    }

    // 3. Respaldo: Si estamos probando en local o se pasaron query params en la URL
    const searchParams = new URLSearchParams(window.location.search);
    const accountIdParam = searchParams.get('account_id');
    const conversationIdParam = searchParams.get('conversation_id');

    if (accountIdParam) {
      const parsedId = parseInt(accountIdParam, 10);
      fetchConfigForAccount(parsedId, conversationIdParam ? parseInt(conversationIdParam, 10) : null);
    } else {
      // Si pasan 3 segundos y Chatwoot no ha respondido con postMessage ni hay query params
      const timeout = setTimeout(() => {
        setIsLoading((currentLoading) => {
          if (currentLoading) {
            setError('Esperando identificación de Chatwoot... (Si estás probando fuera de Chatwoot, agrega ?account_id=1 a la URL)');
          }
          return false;
        });
      }, 3500);

      return () => {
        window.removeEventListener('message', handleMessage);
        clearTimeout(timeout);
      };
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const saveConfig = async (newConfig: any) => {
    if (!context.accountId) return;
    try {
      setIsLoading(true);
      const updatedData = await ApiService.updateBotConfig(context.accountId, newConfig);
      setConfig(updatedData);
      alert('¡Configuración guardada exitosamente!');
    } catch (err) {
      console.error(err);
      alert('Error al guardar la configuración.');
    } finally {
      setIsLoading(false);
    }
  };

  return { context, config, isLoading, error, saveConfig };
}
