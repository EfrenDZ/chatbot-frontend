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

  useEffect(() => {
    // 1. Extraer los parámetros que Chatwoot inyecta en la URL del iframe
    const searchParams = new URLSearchParams(window.location.search);
    const accountIdParam = searchParams.get('account_id');
    const conversationIdParam = searchParams.get('conversation_id');

    if (!accountIdParam) {
      setError('No se pudo identificar la cuenta de Chatwoot (account_id faltante).');
      setIsLoading(false);
      return;
    }

    const accountId = parseInt(accountIdParam, 10);
    setContext({
      accountId,
      conversationId: conversationIdParam ? parseInt(conversationIdParam, 10) : null,
    });

    // 2. Traer la configuración del bot para esta cuenta
    ApiService.getBotConfig(accountId)
      .then((data) => {
        setConfig(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Error de conexión con el servidor del Bot.');
        setIsLoading(false);
      });
  }, []);

  // 3. Función para guardar cambios desde la UI
  const saveConfig = async (newConfig: any) => {
    if (!context.accountId) return;
    try {
      setIsLoading(true);
      const updatedData = await ApiService.updateBotConfig(context.accountId, newConfig);
      setConfig(updatedData);
      // Aquí podrías mostrar un toast de éxito
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar la configuración.');
    } finally {
      setIsLoading(false);
    }
  };

  return { context, config, isLoading, error, saveConfig };
}
