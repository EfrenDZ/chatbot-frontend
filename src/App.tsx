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
      setFormData({
        ...config,
        isActive: config.isActive !== undefined ? config.isActive : true,
      });
      if (config.flowGraph && config.flowGraph.nodes && config.flowGraph.nodes.length > 0) {
        setNodes(config.flowGraph.nodes);
        setRootNodeId(config.flowGraph.rootNodeId || config.flowGraph.nodes[0].id);
      } else {
        // Inicialización por defecto
        setNodes([{ id: 'node-root', type: 'MENU', text: '¡Hola! Bienvenido. Elige una opción:', options: [] }]);
        setRootNodeId('node-root');
      }
    }
  }, [config]);

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-red-50">
        <div className="text-center text-red-600 font-medium p-4 border border-red-200 rounded-md bg-white shadow-xs">
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

  const isBotActive = formData.isActive !== false;
  const botMode = formData.botMode || 'HYBRID';
  const showFlowBuilder = botMode === 'OPTIONS' || botMode === 'HYBRID';
  const showAiSettings = botMode === 'AI' || botMode === 'HYBRID';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const toggleBotActive = () => {
    setFormData((prev: any) => ({
      ...prev,
      isActive: prev.isActive === false ? true : false,
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
      text: 'Nueva respuesta o submenú...'
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
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isRoot ? 'text-chatwoot' : node.type === 'HANDOFF' ? 'text-amber-600' : 'text-gray-500'}`}>
              {isRoot ? 'Punto de Inicio (Bienvenida)' : node.type === 'HANDOFF' ? 'Transferir a Humano' : 'Acción / Respuesta'}
            </span>
            <select
              value={node.type}
              onChange={(e) => updateNodeType(node.id, e.target.value as NodeType)}
              className="text-sm border border-gray-300 rounded p-1.5 focus:ring-chatwoot focus:border-chatwoot bg-gray-50 font-medium"
            >
              <option value="MESSAGE">Mensaje de Texto (Fin)</option>
              <option value="MENU">Sub-Menú de Opciones</option>
              {botMode === 'HYBRID' && <option value="AI">Delegar a Inteligencia Artificial</option>}
              <option value="HANDOFF">Transferir a un Asesor Humano</option>
            </select>
          </div>

          <textarea
            rows={node.type === 'MENU' ? 2 : 3}
            value={node.text}
            onChange={(e) => updateNodeText(node.id, e.target.value)}
            placeholder={
              node.type === 'AI' 
                ? "Instrucción o contexto para la IA antes de delegarle..." 
                : node.type === 'HANDOFF'
                ? "Mensaje al cliente antes de transferir (ej: 'Te estoy transfiriendo con un asesor humano...')"
                : "Escribe el mensaje del bot aquí..."
            }
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-chatwoot focus:border-chatwoot mb-1 font-medium text-gray-800"
          />

          {node.type === 'HANDOFF' && (
            <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200 mt-2">
              Al llegar a este bloque, el bot enviará el mensaje anterior, pausará automáticamente la atención robótica y abrirá la conversación en Chatwoot para tus agentes.
            </p>
          )}

          {node.type === 'MENU' && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Opciones del usuario:</p>
              <div className="space-y-3">
                {node.options?.map((opt, index) => (
                  <div key={opt.id} className="relative bg-gray-50 p-3.5 rounded-lg border border-gray-200/70">
                    <div className="flex gap-2 items-center">
                      <span className="text-gray-400 font-mono text-sm font-bold">{index + 1}.</span>
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => updateOptionLabel(node.id, opt.id, e.target.value)}
                        placeholder="Ej: Ver catálogo o Precios"
                        className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-chatwoot focus:border-chatwoot bg-white font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(node.id, opt.id, opt.targetNodeId)}
                        className="text-red-400 hover:text-red-600 text-sm px-2.5 py-1 font-bold rounded hover:bg-red-50 transition-colors"
                        title="Eliminar opción y su rama"
                      >
                        ✕
                      </button>
                    </div>
                    {/* Renderizado Recursivo de la Rama Hija */}
                    {renderNode(opt.targetNodeId, depth + 1, false)}
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={() => addOption(node.id)}
                className="mt-3 text-sm font-semibold text-chatwoot hover:text-blue-700 bg-blue-50/60 border border-blue-100 px-4 py-2 rounded-md w-full text-left transition-colors"
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
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-6 font-sans pb-24">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xs border border-gray-200/80 overflow-hidden">
        
        {/* Header con Switch de Encendido/Apagado */}
        <div className="bg-chatwoot px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">Configuración del Bot</h1>
            <p className="text-blue-100 opacity-90 text-xs mt-0.5">
              Cuenta Chatwoot: #{context.accountId}
            </p>
          </div>

          {/* Switch de Encendido / Apagado */}
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg border border-white/15">
            <span className="text-xs font-semibold text-white tracking-wide">
              {isBotActive ? 'BOT ACTIVO' : 'BOT APAGADO'}
            </span>
            <button
              type="button"
              onClick={toggleBotActive}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isBotActive ? 'bg-emerald-400' : 'bg-gray-400'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                  isBotActive ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Banner de Estado si está apagado */}
        {!isBotActive && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-amber-800 text-sm">
            <span><strong>El bot se encuentra apagado:</strong> No responderá mensajes entrantes y todas las conversaciones quedarán abiertas directamente para tus agentes humanos.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* SECCIÓN 1: Comportamiento del Bot (Hasta Arriba) */}
          <section className="bg-gray-50/70 p-5 rounded-xl border border-gray-200">
            <h2 className="text-base font-bold text-gray-900 mb-1 text-chatwoot">
              Modo de Operación Principal
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Selecciona la estrategia de atención. La interfaz inferior se adaptará automáticamente a tu selección.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label 
                className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${
                  botMode === 'OPTIONS' 
                    ? 'border-chatwoot bg-blue-50/40 ring-1 ring-chatwoot' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="botMode" 
                  value="OPTIONS" 
                  checked={botMode === 'OPTIONS'} 
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="font-bold text-sm text-gray-900 mb-1">Solo Menú Estricto</span>
                <span className="text-xs text-gray-500 leading-relaxed">
                  Menús guiados paso a paso sin IA. Ideal para flujos cerrados y respuestas exactas.
                </span>
              </label>

              <label 
                className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${
                  botMode === 'AI' 
                    ? 'border-chatwoot bg-blue-50/40 ring-1 ring-chatwoot' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="botMode" 
                  value="AI" 
                  checked={botMode === 'AI'} 
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="font-bold text-sm text-gray-900 mb-1">Solo Inteligencia Artificial</span>
                <span className="text-xs text-gray-500 leading-relaxed">
                  Atención conversacional libre con Gemini. Sin botones ni árboles rígidos.
                </span>
              </label>

              <label 
                className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${
                  botMode === 'HYBRID' 
                    ? 'border-chatwoot bg-blue-50/40 ring-1 ring-chatwoot' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="botMode" 
                  value="HYBRID" 
                  checked={botMode === 'HYBRID'} 
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="font-bold text-sm text-gray-900 mb-1">Híbrido (Recomendado)</span>
                <span className="text-xs text-gray-500 leading-relaxed">
                  Presenta el menú guiado de entrada, y activa la IA como respaldo inteligente o en ramas específicas.
                </span>
              </label>
            </div>

            {botMode !== 'AI' && (
              <div className="mt-4 pt-4 border-t border-gray-200/60 max-w-xs">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tolerancia de errores en menú antes de IA / Handoff
                </label>
                <input 
                  type="number" 
                  name="maxConsecutiveErrors" 
                  value={formData.maxConsecutiveErrors || 2} 
                  onChange={handleChange}
                  min={1}
                  max={5}
                  className="w-24 border border-gray-300 rounded-md shadow-xs p-1.5 text-sm focus:ring-chatwoot focus:border-chatwoot bg-white"
                />
              </div>
            )}
          </section>

          {/* SECCIÓN 2: Constructor de Flujos (Condicional: OPTIONS o HYBRID) */}
          {showFlowBuilder && (
            <section className="space-y-4">
              <div className="border-b pb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900 text-chatwoot">
                    Constructor de Flujos de Menú
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    WhatsApp transformará automáticamente las opciones en <strong>Botones</strong> (hasta 3) o <strong>Menú de Lista</strong> (hasta 10).
                  </p>
                </div>
              </div>

              <div className="bg-gray-50/80 p-4 md:p-6 rounded-xl border border-gray-200 overflow-x-auto">
                <div className="min-w-[550px]">
                  {renderNode(rootNodeId, 0, true)}
                </div>
              </div>
            </section>
          )}

          {/* SECCIÓN 3: Configuración de Inteligencia Artificial (Condicional: AI o HYBRID) */}
          {showAiSettings && (
            <section className="space-y-4">
              <div className="border-b pb-2">
                <h2 className="text-base font-bold text-gray-900 text-chatwoot">
                  Parámetros de Inteligencia Artificial (Gemini)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Define el comportamiento, tono y los límites de seguridad de la IA.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                    Límite de Mensajes de IA por Conversación
                  </label>
                  <input 
                    type="number" 
                    name="maxAiMessages" 
                    value={formData.maxAiMessages || 10} 
                    onChange={handleChange}
                    className="w-full md:w-1/3 border border-gray-300 rounded-md shadow-xs p-2 text-sm focus:ring-chatwoot focus:border-chatwoot bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Protección de costos: una vez alcanzado este número, el bot transfiere automáticamente la conversación a un humano.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                    Instrucciones del Sistema (Prompt de la Empresa)
                  </label>
                  <textarea 
                    name="systemPrompt" 
                    rows={5}
                    value={formData.systemPrompt || ''} 
                    onChange={handleChange}
                    placeholder="Eres el asistente virtual de la empresa. Ofreces información cordial sobre horarios, precios y políticas..."
                    className="w-full border border-gray-300 rounded-md shadow-xs p-3 text-sm focus:ring-chatwoot focus:border-chatwoot font-mono"
                  />
                </div>
              </div>
            </section>
          )}

          {/* SECCIÓN 4: Mensajes Generales del Sistema */}
          <section className="space-y-4">
            <div className="border-b pb-2">
              <h2 className="text-base font-bold text-gray-900 text-chatwoot">
                Mensajes del Sistema
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mensaje Inicial (Bienvenida)
                </label>
                <input 
                  type="text" 
                  name="welcomeMessage" 
                  value={formData.welcomeMessage || ''} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-chatwoot focus:border-chatwoot"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mensaje de Despedida (Al resolver)
                </label>
                <input 
                  type="text" 
                  name="farewellMessage" 
                  value={formData.farewellMessage || ''} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-chatwoot focus:border-chatwoot"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mensaje de Transferencia (Handoff a humano)
                </label>
                <input 
                  type="text" 
                  name="handoffMessage" 
                  value={formData.handoffMessage || ''} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-chatwoot focus:border-chatwoot"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mensaje de Fallback (Error de Menú)
                </label>
                <input 
                  type="text" 
                  name="fallbackMessage" 
                  value={formData.fallbackMessage || ''} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-chatwoot focus:border-chatwoot"
                />
              </div>
            </div>
          </section>

          {/* Botón de Guardado */}
          <div className="pt-4 border-t flex justify-end">
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-chatwoot hover:bg-blue-600 text-white px-8 py-3 rounded-lg shadow-sm font-bold text-base transition-colors disabled:opacity-50 cursor-pointer"
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
