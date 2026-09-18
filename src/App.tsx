import { useState, useEffect } from 'react';
import { useChatwootContext } from './hooks/useChatwootContext';
import './index.css';

type NodeType = 'MENU' | 'MESSAGE' | 'AI' | 'HANDOFF';

interface FlowOption {
  id: string;
  label: string;
  targetNodeId: string;
}

interface FlowNode {
  id: string;
  type: NodeType;
  text: string;
  options?: FlowOption[];
}

function App() {
  const { context, config, isLoading, error, saveConfig } = useChatwootContext();
  const [formData, setFormData] = useState<any>(null);

  // Estados del Flujo (Árbol N-Niveles)
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [rootNodeId, setRootNodeId] = useState<string>('node-root');

  useEffect(() => {
    if (config) {
      setFormData(config);
      if (config.flowGraph && config.flowGraph.nodes && config.flowGraph.nodes.length > 0) {
        setNodes(config.flowGraph.nodes);
        setRootNodeId(config.flowGraph.rootNodeId || config.flowGraph.nodes[0].id);
      } else {
        // Init default
        setNodes([{ id: 'node-root', type: 'MENU', text: '¡Hola! Bienvenido. Elige una opción:', options: [] }]);
        setRootNodeId('node-root');
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

  // --- MUTADORES DEL GRAFO ---
  const updateNodeText = (nodeId: string, text: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, text } : n));
  };

  const updateNodeType = (nodeId: string, type: NodeType) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== nodeId) return n;
      if (type === 'MENU' && !n.options) return { ...n, type, options: [] };
      return { ...n, type };
    }));
  };

  const updateOptionLabel = (nodeId: string, optionId: string, label: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== nodeId || !n.options) return n;
      return {
        ...n,
        options: n.options.map(o => o.id === optionId ? { ...o, label } : o)
      };
    }));
  };

  const addOption = (nodeId: string) => {
    const newTargetId = `node-${Date.now()}`;
    const newOptionId = `opt-${Date.now()}`;
    
    const newNode: FlowNode = {
      id: newTargetId,
      type: 'MESSAGE',
      text: 'Nueva respuesta o menú...'
    };

    setNodes(prev => {
      const parentUpdated = prev.map(n => {
        if (n.id !== nodeId) return n;
        return {
          ...n,
          options: [...(n.options || []), { id: newOptionId, label: 'Nueva Opción', targetNodeId: newTargetId }]
        };
      });
      return [...parentUpdated, newNode];
    });
  };

  const removeOption = (parentNodeId: string, optionId: string, targetNodeId: string) => {
    const getDescendants = (tId: string, allNodes: FlowNode[]): string[] => {
      const tNode = allNodes.find(n => n.id === tId);
      if (!tNode) return [];
      let desc = [tId];
      if (tNode.options) {
        tNode.options.forEach(o => {
           desc = desc.concat(getDescendants(o.targetNodeId, allNodes));
        });
      }
      return desc;
    };

    setNodes(prev => {
      const idsToRemove = getDescendants(targetNodeId, prev);
      const updatedParent = prev.map(n => {
        if (n.id === parentNodeId && n.options) {
          return { ...n, options: n.options.filter(o => o.id !== optionId) };
        }
        return n;
      });
      return updatedParent.filter(n => !idsToRemove.includes(n.id));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig({
      ...formData,
      flowGraph: { rootNodeId, nodes }
    });
  };

  // --- RENDER RECURSIVO DEL GRAFO ---
  const renderNode = (nodeId: string, depth: number = 0, isRoot: boolean = false) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    return (
      <div key={node.id} className={`relative ${isRoot ? '' : 'pl-6 border-l-2 border-gray-200 ml-4 mt-4'}`}>
        {!isRoot && <div className="absolute -left-[2px] top-6 w-6 h-0.5 bg-gray-200"></div>}
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isRoot ? 'text-chatwoot' : node.type === 'HANDOFF' ? 'text-amber-600' : 'text-gray-500'}`}>
              {isRoot ? '🚀 Punto de Inicio' : node.type === 'HANDOFF' ? '👤 Transferir a Asesor Humano' : '↳ Acción / Respuesta'}
            </span>
            <select
              value={node.type}
              onChange={(e) => updateNodeType(node.id, e.target.value as NodeType)}
              className="text-sm border border-gray-300 rounded p-1 focus:ring-chatwoot focus:border-chatwoot bg-gray-50"
            >
              <option value="MESSAGE">Mensaje de Texto (Fin)</option>
              <option value="MENU">Sub-Menú de Opciones</option>
              <option value="AI">Delegar a Inteligencia Artificial</option>
              <option value="HANDOFF">Transferir a un Asesor Humano</option>
            </select>
          </div>

          <textarea
            rows={node.type === 'MENU' ? 2 : 3}
            value={node.text}
            onChange={(e) => updateNodeText(node.id, e.target.value)}
            placeholder={
              node.type === 'AI' 
                ? "Instrucción oculta para la IA antes de delegarle..." 
                : node.type === 'HANDOFF'
                ? "Mensaje al cliente antes de transferir (ej: 'Te estoy transfiriendo con un asesor humano...')"
                : "Escribe el mensaje del bot aquí..."
            }
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-chatwoot focus:border-chatwoot mb-1 font-medium text-gray-800"
          />

          {node.type === 'HANDOFF' && (
            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
              👤 Al elegir esta opción, el bot enviará el mensaje anterior, se pausará automáticamente y marcará la conversación en Chatwoot como abierta para que un humano responda.
            </p>
          )}

          {node.type === 'MENU' && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Opciones del usuario:</p>
              <div className="space-y-2">
                {node.options?.map((opt, index) => (
                  <div key={opt.id} className="relative bg-gray-50 p-3 rounded border border-gray-100">
                    <div className="flex gap-2 items-center">
                      <span className="text-gray-400 font-mono text-sm font-bold">{index + 1}.</span>
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => updateOptionLabel(node.id, opt.id, e.target.value)}
                        placeholder="Ej: Ver precios"
                        className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-chatwoot focus:border-chatwoot bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(node.id, opt.id, opt.targetNodeId)}
                        className="text-red-400 hover:text-red-600 text-sm p-2 font-bold"
                        title="Eliminar opción y su rama"
                      >
                        ✕
                      </button>
                    </div>
                    {/* RECURSIÓN: Renderizar el nodo hijo */}
                    {renderNode(opt.targetNodeId, depth + 1, false)}
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={() => addOption(node.id)}
                className="mt-3 text-sm font-semibold text-chatwoot hover:text-blue-700 bg-blue-50/50 border border-blue-100 px-4 py-2 rounded-md w-full text-left transition-colors"
              >
                + Añadir Nueva Opción
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 font-sans pb-20">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="bg-chatwoot px-6 py-4">
          <h1 className="text-xl font-semibold text-white">Configuración del Bot (Modo Avanzado)</h1>
          <p className="text-blue-100 opacity-90 text-sm mt-1">
            ID de Cuenta: {context.accountId}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-10">
          
          <section>
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-6 text-chatwoot">1. Constructor de Flujos</h2>
            <p className="text-sm text-gray-500 mb-6">
              Construye menús infinitos. Cambia el tipo de bloque a <strong>Sub-Menú</strong> para ramificar, a <strong>Mensaje</strong> para dar información final, o a <strong>Delegar a IA</strong> para que Gemini tome el control de esa rama.
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 overflow-x-auto">
              <div className="min-w-[600px]">
                {renderNode(rootNodeId, 0, true)}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 text-chatwoot">2. Inteligencia Artificial (Avanzado)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comportamiento del Bot</label>
                <select 
                  name="botMode" 
                  value={formData.botMode} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-chatwoot focus:border-chatwoot bg-white"
                >
                  <option value="OPTIONS">Solo Menú Estricto (Ignora IA)</option>
                  <option value="AI">Solo Inteligencia Artificial (Ignora Menú)</option>
                  <option value="HYBRID">Híbrido (Menú primero, IA si falla o delega)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Errores antes de invocar IA / Asesor</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Límite de Tokens (Interacciones IA)</label>
                <input 
                  type="number" 
                  name="maxAiMessages" 
                  value={formData.maxAiMessages} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-chatwoot focus:border-chatwoot"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt del Sistema Central</label>
                <textarea 
                  name="systemPrompt" 
                  rows={4}
                  value={formData.systemPrompt} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-chatwoot focus:border-chatwoot"
                />
              </div>
            </div>
          </section>

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
