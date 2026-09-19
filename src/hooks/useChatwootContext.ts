declare global {
  interface Window {
    chatwootIframeActive: boolean;
  }
}
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
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('zabotek_auth_token'));

  const fetchConfigForAccount = async (accountId: number, conversationId: number | null = null) => {
    try {
      setIsLoading(true);
      setContext({ accountId, conversationId });
      const data = await ApiService.getBotConfig(accountId);
      setConfig(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      if (err.message === 'No autorizado') {
        setIsAuthenticated(false);
      } else {
        setError('Error al conectar con la base de datos o inicializar el perfil.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Si estamos fuera de Chatwoot (standalone) y ya hay cuenta por defecto, usarla al inicio
    const defaultAcc = localStorage.getItem('zabotek_default_account');
    if (defaultAcc && !context.accountId) {
      // Pequeño retraso para dar prioridad al iframe si existe
      setTimeout(() => {
        if (!window.chatwootIframeActive) {
          fetchConfigForAccount(parseInt(defaultAcc, 10));
        }
      }, 500);
    }

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

      // Si no estamos autenticados y recibimos postMessage de Chatwoot, hacemos auto-login silencioso
      const accountIdRaw = payload?.data?.conversation?.account_id || payload?.data?.currentAgent?.account_id || payload?.data?.account?.id || payload?.conversation?.account_id || payload?.account?.id;
      
      if (accountIdRaw && !localStorage.getItem('zabotek_auth_token')) {
         ApiService.iframeAutoLogin(accountIdRaw).then(data => {
            localStorage.setItem('zabotek_auth_token', data.token);
            setIsAuthenticated(true);
            fetchConfigForAccount(accountIdRaw);
         }).catch(console.error);
         return; // Evita doble fetch
      }

      // Chatwoot envía datos de contexto dentro de conversation o currentAgent
      window.chatwootIframeActive = true;
      const accountId = 
        payload?.data?.conversation?.account_id ||
        payload?.data?.currentAgent?.account_id ||
        payload?.data?.account?.id ||
        payload?.conversation?.account_id ||
        payload?.account?.id;

      const conversationId = 
        payload?.data?.conversation?.id || 
        payload?.conversation?.id;

      console.log('[Chatwoot Dashboard App] Payload recibido:', payload, 'accountId detectado:', accountId);

      if (accountId) {
        fetchConfigForAccount(Number(accountId), conversationId ? Number(conversationId) : null);
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
      setIsSaving(true);
      const updatedData = await ApiService.updateBotConfig(context.accountId, newConfig);
      setConfig(updatedData);
      setNotification({ message: '¡Configuración guardada exitosamente!', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Error al guardar la configuración.', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return { context, config, isLoading, isSaving, notification, error, isAuthenticated, setIsAuthenticated, saveConfig, fetchConfigForAccount };
}
