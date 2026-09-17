import { useState, useEffect } from 'react';
import { useChatwootContext } from './hooks/useChatwootContext';
import './index.css';

function App() {
  const { context, config, isLoading, error, saveConfig } = useChatwootContext();
  const [formData, setFormData] = useState<any>(null);

  // Sincronizar el estado local cuando llegue la configuración del servidor
  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-red-50">
        <div className="text-center text-red-600 font-medium p-4 border border-red-200 rounded-md bg-white">
          {error}
        </div>
      </div>
    );
  }

  if (isLoading || !formData) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chatwoot"></div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-chatwoot px-6 py-4">
          <h1 className="text-xl font-semibold text-white">Configuración del Bot</h1>
          <p className="text-chatwoot-100 text-sm text-blue-100 opacity-90">
            ID de Cuenta: {context.accountId}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Sección 1: Modo de Operación */}
          <section>
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Modo de Operación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comportamiento del Bot</label>
                <select 
                  name="botMode" 
                  value={formData.botMode} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-chatwoot focus:border-chatwoot"
                >
                  <option value="OPTIONS">Solo Menú Estricto (Sin IA)</option>
                  <option value="AI">Solo Inteligencia Artificial</option>
                  <option value="HYBRID">Híbrido (Menú primero, IA como respaldo)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Errores antes de IA / Handoff</label>
                <input 
                  type="number" 
                  name="maxConsecutiveErrors" 
                  value={formData.maxConsecutiveErrors} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-chatwoot focus:border-chatwoot"
                />
              </div>
            </div>
          </section>

          {/* Sección 2: Inteligencia Artificial */}
          <section>
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Configuración de IA</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Límite de Mensajes (Tokens)</label>
                <input 
                  type="number" 
                  name="maxAiMessages" 
                  value={formData.maxAiMessages} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-chatwoot focus:border-chatwoot"
                />
                <p className="text-xs text-gray-500 mt-1">Cuántos mensajes puede intercambiar la IA antes de transferir a un humano forzosamente.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt del Sistema (Instrucciones)</label>
                <textarea 
                  name="systemPrompt" 
                  rows={4}
                  value={formData.systemPrompt} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-chatwoot focus:border-chatwoot"
                  placeholder="Eres un asistente útil y amable..."
                />
              </div>
            </div>
          </section>

          {/* Sección 3: Mensajes del Sistema */}
          <section>
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Mensajes del Sistema</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje de Transferencia (Handoff)</label>
                <input 
                  type="text" 
                  name="handoffMessage" 
                  value={formData.handoffMessage} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-chatwoot focus:border-chatwoot"
                />
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="pt-4 border-t flex justify-end">
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-chatwoot hover:bg-blue-600 text-white px-6 py-2 rounded-md shadow-sm font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
