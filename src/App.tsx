import { useState, useEffect } from 'react';
import { useChatwootContext } from './hooks/useChatwootContext';
import './index.css';

interface MenuOptionUI {
  id: string;
  label: string;
  response: string;
}

function App() {
  const { context, config, isLoading, error, saveConfig } = useChatwootContext();
  const [formData, setFormData] = useState<any>(null);

  // Estados específicos para el Editor de Menú
  const [welcomeText, setWelcomeText] = useState('');
  const [menuOptions, setMenuOptions] = useState<MenuOptionUI[]>([]);

  // Sincronizar el estado local cuando llegue la configuración del servidor
  useEffect(() => {
    if (config) {
      setFormData(config);
      
      // Parsear el JSON del flowGraph al estado simplificado del frontend
      if (config.flowGraph && config.flowGraph.nodes) {
        const rootNode = config.flowGraph.nodes.find((n: any) => n.id === config.flowGraph.rootNodeId);
        if (rootNode && rootNode.type === 'MENU') {
          setWelcomeText(rootNode.text);
          const extractedOptions: MenuOptionUI[] = (rootNode.options || []).map((opt: any) => {
            const targetNode = config.flowGraph.nodes.find((n: any) => n.id === opt.targetNodeId);
            return {
              id: opt.id,
              label: opt.label,
              response: targetNode ? targetNode.text : ''
            };
          });
          setMenuOptions(extractedOptions);
        }
      }
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

  if (isLoading && !formData) {
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

  const handleOptionChange = (id: string, field: 'label' | 'response', value: string) => {
    setMenuOptions(prev => prev.map(opt => opt.id === id ? { ...opt, [field]: value } : opt));
  };

  const handleAddOption = () => {
    const newId = `opt-${Date.now()}`;
    setMenuOptions(prev => [...prev, { id: newId, label: 'Nueva opción', response: 'Mensaje de respuesta...' }]);
  };

  const handleRemoveOption = (id: string) => {
    setMenuOptions(prev => prev.filter(opt => opt.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Reconstruir el flowGraph a partir de nuestro formulario dinámico
    const nodes: any[] = [];
    
    // Nodo Raíz (Menú)
    const rootNode = {
      id: 'node-root',
      type: 'MENU',
      text: welcomeText,
      options: menuOptions.map(opt => ({
        id: opt.id,
        label: opt.label,
        targetNodeId: `node-${opt.id}`
      }))
    };
    nodes.push(rootNode);

    // Nodos de Respuesta (Mensajes)
    menuOptions.forEach(opt => {
      nodes.push({
        id: `node-${opt.id}`,
        type: 'MESSAGE',
        text: opt.response
      });
    });

    const flowGraph = { rootNodeId: 'node-root', nodes };

    // 2. Guardar en Backend
    saveConfig({
      ...formData,
      flowGraph
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 font-sans pb-20">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-chatwoot px-6 py-4">
          <h1 className="text-xl font-semibold text-white">Configuración del Bot</h1>
          <p className="text-blue-100 opacity-90 text-sm mt-1">
            ID de Cuenta: {context.accountId}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* NUEVA SECCIÓN: Creador de Menú */}
          <section>
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 text-chatwoot">1. Opciones del Menú Principal</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje de Bienvenida del Bot</label>
              <textarea 
                rows={3}
                value={welcomeText} 
                onChange={(e) => setWelcomeText(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-chatwoot focus:border-chatwoot"
                placeholder="¡Hola! Bienvenido. Por favor elige una opción:"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Botones del menú interactivo</label>
              {menuOptions.map((opt, index) => (
                <div key={opt.id} className="bg-gray-50 p-4 border border-gray-200 rounded-md flex flex-col gap-3 relative">
                  <button 
                    type="button" 
                    onClick={() => handleRemoveOption(opt.id)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Opción {index + 1} (Texto del botón)</label>
                    <input 
                      type="text" 
                      value={opt.label} 
                      onChange={(e) => handleOptionChange(opt.id, 'label', e.target.value)}
                      className="w-full md:w-1/2 border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-chatwoot focus:border-chatwoot"
                      placeholder="Ej: 1. Ver Precios"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Respuesta del Bot</label>
                    <textarea 
                      rows={2}
                      value={opt.response} 
                      onChange={(e) => handleOptionChange(opt.id, 'response', e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-chatwoot focus:border-chatwoot"
                      placeholder="Respuesta automática cuando el cliente hace clic en esta opción."
                    />
                  </div>
                </div>
              ))}

              <button 
                type="button" 
                onClick={handleAddOption}
                className="mt-2 text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                + Añadir Opción
              </button>
            </div>
          </section>

          {/* Sección: Modo de Operación */}
          <section>
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 text-chatwoot">2. Configuración de Inteligencia Artificial</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Errores antes de invocar IA o Asesor</label>
                <input 
                  type="number" 
                  name="maxConsecutiveErrors" 
                  value={formData.maxConsecutiveErrors} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-chatwoot focus:border-chatwoot"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Límite de Mensajes (IA)</label>
                <input 
                  type="number" 
                  name="maxAiMessages" 
                  value={formData.maxAiMessages} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-chatwoot focus:border-chatwoot"
                />
                <p className="text-xs text-gray-500 mt-1">Cuántos mensajes seguidos puede intercambiar la IA antes de transferir a un humano forzosamente.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt del Sistema (Instrucciones para la IA)</label>
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

          {/* Sección: Mensajes del Sistema */}
          <section>
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 text-chatwoot">3. Mensajes Generales</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje de Transferencia (Handoff a humano)</label>
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
              className="bg-chatwoot hover:bg-blue-600 text-white px-8 py-3 rounded-md shadow-sm font-bold text-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Guardar y Aplicar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
