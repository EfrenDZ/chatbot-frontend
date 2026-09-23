import { useState, useEffect } from 'react';
import { useChatwootContext } from './hooks/useChatwootContext';
import './index.css';
import { ApiService } from './services/api';
import { Login } from './components/Login';
import { FlowCanvas } from './components/FlowEditor/FlowCanvas';

import type { FlowNode } from './types';





function App() {
  const { context, config, isLoading, isSaving, notification, error, isAuthenticated, setIsAuthenticated, saveConfig, fetchConfigForAccount } = useChatwootContext();
  const [formData, setFormData] = useState<any>(null);

  // Estados del Flujo (Árbol N-Niveles)
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [rootNodeId, setRootNodeId] = useState<string>('node-root');
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'FLOW' | 'AI' | 'SYSTEM'>('DASHBOARD');
  const [metrics, setMetrics] = useState<any>(null);
  const [aiSubTab, setAiSubTab] = useState<'GENERAL' | 'CATALOG' | 'FAQS' | 'BRANCHES'>('GENERAL');

  const botMode = formData?.botMode || 'HYBRID';
  useEffect(() => { 
    if (botMode === 'OPTIONS' && activeTab === 'AI') setActiveTab('FLOW'); 
    if (botMode === 'AI' && activeTab === 'FLOW') setActiveTab('AI'); 
  }, [botMode, activeTab]);

  const updateAiKnowledge = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      aiKnowledge: {
        ...(prev.aiKnowledge || {}),
        [key]: value
      }
    }));
  };


  useEffect(() => {
    if (context?.accountId) {
      ApiService.getMetrics(context.accountId)
        .then(data => setMetrics(data))
        .catch(err => console.error('Error cargando métricas:', err));
    }
  }, [context]);

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
        setNodes([{ id: 'node-root', type: 'MENU', text: '¡Hola! Bienvenido. Elige una opción:', messages: ['¡Hola! Bienvenido. Elige una opción:'], options: [] }]);
        setRootNodeId('node-root');
      }
    }
  }, [config]);







  if (!isAuthenticated) {
    return <Login onSuccess={() => {
      setIsAuthenticated(true);
      if (context.accountId) fetchConfigForAccount(context.accountId, context.conversationId);
      else fetchConfigForAccount(1); // Default
    }} />;
  }

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
  
  
  
  
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig({
      ...formData,
      flowGraph: { rootNodeId, nodes }
    });
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

          
          {/* NAVEGACIÓN POR PESTAÑAS */}
          <div className="border-b border-gray-200 mt-8 mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">

              <button
                type="button"
                onClick={() => setActiveTab('DASHBOARD')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'DASHBOARD'
                    ? 'border-chatwoot text-chatwoot'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Métricas (Últimos 30 días)
                </div>
              </button>

              {showFlowBuilder && (
                <button
                  type="button"
                  onClick={() => setActiveTab('FLOW')}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'FLOW'
                      ? 'border-chatwoot text-chatwoot'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    Constructor de Flujo
                  </div>
                </button>
              )}
              
              {showAiSettings && (
                <button
                  type="button"
                  onClick={() => setActiveTab('AI')}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'AI'
                      ? 'border-chatwoot text-chatwoot'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Conocimiento de IA
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('SYSTEM')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'SYSTEM'
                    ? 'border-chatwoot text-chatwoot'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Ajustes y Mensajes
                </div>
              </button>
            </nav>
          </div>

          
          {/* SECCIÓN 0: DASHBOARD */}
          {activeTab === 'DASHBOARD' && (
            <section className="space-y-6">
              <div className="border-b pb-2">
                <h2 className="text-base font-bold text-gray-900 text-chatwoot">Panel de Rendimiento (Últimos 30 Días)</h2>
                <p className="text-xs text-gray-500 mt-0.5">Métricas de impacto del asistente virtual en tu operación.</p>
              </div>

              {!metrics ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chatwoot"></div></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Conversaciones</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalSessions}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Atendidas por el bot</p>
                  </div>
                  
                  <div className="bg-white border border-green-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-xs font-bold text-green-600 uppercase">Resueltas por IA</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.resolvedSessions}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Sin ayuda humana</p>
                  </div>

                  <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <svg className="w-16 h-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <p className="text-xs font-bold text-amber-600 uppercase">Transferidas a Humanos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.handedOffSessions}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Requieren atención</p>
                  </div>

                  <div className="bg-white border border-purple-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <svg className="w-16 h-16 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <p className="text-xs font-bold text-purple-600 uppercase">Mensajes IA Consumidos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.aiMessagesConsumed}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Respuestas generadas</p>
                  </div>
                </div>
              )}
            </section>
          )}


          {/* SECCIÓN 2: Constructor de Flujos (Condicional: OPTIONS o HYBRID) */}
          {activeTab === 'FLOW' && showFlowBuilder && (
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

              <div className="bg-white rounded-xl border border-gray-200">
                <FlowCanvas nodes={nodes} setNodes={setNodes} rootNodeId={rootNodeId} botMode={botMode} />
              </div>
            </section>
          )}

          {/* SECCIÓN 3: Configuración de Inteligencia Artificial (Condicional: AI o HYBRID) */}
          {activeTab === 'AI' && showAiSettings && (
            <section className="space-y-4">
              <div className="border-b pb-2">
                <h2 className="text-base font-bold text-gray-900 text-chatwoot">
                  Parámetros de Inteligencia Artificial (Gemini)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Define el comportamiento, tono y los límites de seguridad de la IA.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                    Modo de Prompt
                  </label>
                  <select
                    name="aiPromptMode"
                    value={formData.aiPromptMode || 'STRUCTURED'}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-chatwoot focus:border-chatwoot bg-white font-bold text-chatwoot"
                  >
                    <option value="STRUCTURED">Constructor Estructurado (Recomendado)</option>
                    <option value="FREE">Modo Libre (Prompt Manual)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Usa el constructor para una IA precisa, o el modo libre si eres experto en prompts.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                    Límite de Mensajes de IA
                  </label>
                  <input 
                    type="number" 
                    name="maxAiMessages" 
                    value={formData.maxAiMessages || 10} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-xs p-2 text-sm focus:ring-chatwoot focus:border-chatwoot bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Protección de costos: transferirá a humano al llegar al límite.
                  </p>
                </div>
              </div>

              {(formData.aiPromptMode === 'FREE') ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 flex items-center justify-between">
                    <span>Instrucciones del Sistema (Prompt de la Empresa)</span>
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px]">Modo Libre</span>
                  </label>
                  <textarea 
                    name="systemPrompt" 
                    rows={12}
                    value={formData.systemPrompt || ''} 
                    onChange={handleChange}
                    placeholder="Eres el asistente virtual de la empresa..."
                    className="w-full border border-gray-300 rounded-md shadow-xs p-3 text-sm focus:ring-chatwoot focus:border-chatwoot font-mono bg-gray-50"
                  />
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-4 border border-gray-200 rounded-xl overflow-hidden bg-white">
                  {/* Menú Lateral de Sub-Pestañas */}
                  <div className="w-full md:w-1/4 bg-gray-50 border-r border-gray-200 flex flex-col">
                    {[
                      { id: 'GENERAL', label: 'Perfil y Reglas' },
                      { id: 'CATALOG', label: 'Catálogo / Oferta' },
                      { id: 'FAQS', label: 'Preguntas Frecuentes' },
                      { id: 'BRANCHES', label: 'Sucursales' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setAiSubTab(tab.id as any)}
                        className={`text-left px-4 py-3 text-sm font-semibold transition-colors ${
                          aiSubTab === tab.id 
                            ? 'bg-blue-50 text-chatwoot border-l-4 border-chatwoot' 
                            : 'text-gray-600 hover:bg-gray-100 border-l-4 border-transparent'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Contenido de la Sub-Pestaña */}
                  <div className="w-full md:w-3/4 p-5">
                    {aiSubTab === 'GENERAL' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre del Negocio / Marca</label>
                          <input 
                            type="text" 
                            value={formData.aiKnowledge?.businessName || ''} 
                            onChange={(e) => updateAiKnowledge('businessName', e.target.value)}
                            placeholder="Ej: Zabotek Solutions"
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-chatwoot"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción corta (A qué se dedican)</label>
                          <textarea 
                            rows={2}
                            value={formData.aiKnowledge?.businessDescription || ''} 
                            onChange={(e) => updateAiKnowledge('businessDescription', e.target.value)}
                            placeholder="Ej: Agencia de desarrollo web y automatización con IA."
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-chatwoot"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Tono de conversación</label>
                          <input 
                            type="text" 
                            value={formData.aiKnowledge?.tone || ''} 
                            onChange={(e) => updateAiKnowledge('tone', e.target.value)}
                            placeholder="Ej: Amable, profesional y directo."
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-chatwoot"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Reglas Especiales</label>
                          <div className="space-y-2 mb-2">
                            {(formData.aiKnowledge?.rules || []).map((rule: string, idx: number) => (
                              <div key={idx} className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={rule} 
                                  onChange={(e) => {
                                    const newRules = [...(formData.aiKnowledge?.rules || [])];
                                    newRules[idx] = e.target.value;
                                    updateAiKnowledge('rules', newRules);
                                  }}
                                  className="flex-1 border border-gray-300 rounded p-2 text-sm"
                                />
                                <button type="button" onClick={() => {
                                  const newRules = formData.aiKnowledge.rules.filter((_: any, i: number) => i !== idx);
                                  updateAiKnowledge('rules', newRules);
                                }} className="text-red-500 hover:text-red-700 px-2 font-bold">✕</button>
                              </div>
                            ))}
                          </div>
                          <button type="button" onClick={() => {
                            const newRules = [...(formData.aiKnowledge?.rules || []), ''];
                            updateAiKnowledge('rules', newRules);
                          }} className="text-xs text-chatwoot font-bold">+ Agregar Regla</button>
                        </div>
                        <div className="pt-2">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Contexto Adicional / Otros Datos</label>
                          <textarea 
                            rows={3}
                            value={formData.aiKnowledge?.extraContext || ''} 
                            onChange={(e) => updateAiKnowledge('extraContext', e.target.value)}
                            placeholder="Cualquier otra información que la IA deba saber (ej: políticas especiales, historia de la empresa, etc.)"
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-chatwoot"
                          />
                          <p className="text-[10px] text-gray-500 mt-1">Usa esto para información que no encaje en los demás campos.</p>
                        </div>

                      </div>
                    )}

                    {aiSubTab === 'CATALOG' && (
                      <div>
                        <p className="text-xs text-gray-500 mb-4">Agrega los productos o servicios que la IA puede ofrecer o vender.</p>
                        <div className="space-y-4 mb-4">
                          {(formData.aiKnowledge?.catalog || []).map((item: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                              <button type="button" onClick={() => {
                                const newCat = formData.aiKnowledge.catalog.filter((_: any, i: number) => i !== idx);
                                updateAiKnowledge('catalog', newCat);
                              }} className="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold">✕</button>
                              <div className="grid grid-cols-2 gap-3 pr-6">
                                <div className="col-span-2 md:col-span-1"><label className="text-[10px] uppercase font-bold text-gray-500">Nombre</label><input type="text" value={item.name} onChange={(e) => { const c = [...formData.aiKnowledge.catalog]; c[idx].name = e.target.value; updateAiKnowledge('catalog', c); }} className="w-full border rounded p-1.5 text-sm"/></div>
                                <div className="col-span-2 md:col-span-1"><label className="text-[10px] uppercase font-bold text-gray-500">Precio</label><input type="text" value={item.price} onChange={(e) => { const c = [...formData.aiKnowledge.catalog]; c[idx].price = e.target.value; updateAiKnowledge('catalog', c); }} placeholder="Ej: $50 USD" className="w-full border rounded p-1.5 text-sm"/></div>
                                <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-gray-500">Descripción / Detalles</label><textarea rows={2} value={item.description} onChange={(e) => { const c = [...formData.aiKnowledge.catalog]; c[idx].description = e.target.value; updateAiKnowledge('catalog', c); }} className="w-full border rounded p-1.5 text-sm"/></div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => {
                            const newCat = [...(formData.aiKnowledge?.catalog || []), { name: '', description: '', price: '' }];
                            updateAiKnowledge('catalog', newCat);
                          }} className="text-sm bg-blue-50 text-chatwoot border border-blue-100 rounded px-3 py-1.5 font-bold">+ Agregar Ítem al Catálogo</button>
                      </div>
                    )}

                    {aiSubTab === 'FAQS' && (
                      <div>
                        <p className="text-xs text-gray-500 mb-4">Preguntas que suelen hacer los clientes y su respuesta exacta.</p>
                        <div className="space-y-4 mb-4">
                          {(formData.aiKnowledge?.faqs || []).map((faq: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                              <button type="button" onClick={() => {
                                const newFaqs = formData.aiKnowledge.faqs.filter((_: any, i: number) => i !== idx);
                                updateAiKnowledge('faqs', newFaqs);
                              }} className="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold">✕</button>
                              <div className="space-y-2 pr-6">
                                <div><label className="text-[10px] uppercase font-bold text-gray-500">Pregunta</label><input type="text" value={faq.question} onChange={(e) => { const f = [...formData.aiKnowledge.faqs]; f[idx].question = e.target.value; updateAiKnowledge('faqs', f); }} placeholder="Ej: ¿Tienen estacionamiento?" className="w-full border rounded p-1.5 text-sm font-medium"/></div>
                                <div><label className="text-[10px] uppercase font-bold text-gray-500">Respuesta</label><textarea rows={2} value={faq.answer} onChange={(e) => { const f = [...formData.aiKnowledge.faqs]; f[idx].answer = e.target.value; updateAiKnowledge('faqs', f); }} className="w-full border rounded p-1.5 text-sm"/></div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => {
                            const newFaqs = [...(formData.aiKnowledge?.faqs || []), { question: '', answer: '' }];
                            updateAiKnowledge('faqs', newFaqs);
                          }} className="text-sm bg-blue-50 text-chatwoot border border-blue-100 rounded px-3 py-1.5 font-bold">+ Agregar FAQ</button>
                      </div>
                    )}

                    {aiSubTab === 'BRANCHES' && (
                      <div>
                        <p className="text-xs text-gray-500 mb-4">Sucursales físicas, con sus horarios y enlaces de Google Maps.</p>
                        <div className="space-y-4 mb-4">
                          {(formData.aiKnowledge?.branches || []).map((branch: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                              <button type="button" onClick={() => {
                                const b = formData.aiKnowledge.branches.filter((_: any, i: number) => i !== idx);
                                updateAiKnowledge('branches', b);
                              }} className="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold">✕</button>
                              <div className="space-y-2 pr-6">
                                <div><label className="text-[10px] uppercase font-bold text-gray-500">Nombre de la Sucursal</label><input type="text" value={branch.name} onChange={(e) => { const b = [...formData.aiKnowledge.branches]; b[idx].name = e.target.value; updateAiKnowledge('branches', b); }} placeholder="Ej: Sucursal Centro" className="w-full border rounded p-1.5 text-sm font-medium"/></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div><label className="text-[10px] uppercase font-bold text-gray-500">Horarios</label><textarea rows={2} value={branch.schedule} onChange={(e) => { const b = [...formData.aiKnowledge.branches]; b[idx].schedule = e.target.value; updateAiKnowledge('branches', b); }} placeholder="Lun-Vie 9am-6pm" className="w-full border rounded p-1.5 text-sm"/></div>
                                  <div><label className="text-[10px] uppercase font-bold text-gray-500">Link de Google Maps</label><textarea rows={2} value={branch.mapsLink} onChange={(e) => { const b = [...formData.aiKnowledge.branches]; b[idx].mapsLink = e.target.value; updateAiKnowledge('branches', b); }} placeholder="https://maps.app.goo.gl/..." className="w-full border rounded p-1.5 text-sm"/></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => {
                            const b = [...(formData.aiKnowledge?.branches || []), { name: '', schedule: '', mapsLink: '' }];
                            updateAiKnowledge('branches', b);
                          }} className="text-sm bg-blue-50 text-chatwoot border border-blue-100 rounded px-3 py-1.5 font-bold">+ Agregar Sucursal</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* SECCIÓN 4: Mensajes Generales del Sistema */}
          {activeTab === 'SYSTEM' && ( <div className="space-y-8">

          <section className="space-y-4">
            <div className="border-b pb-2">
              <h2 className="text-base font-bold text-gray-900 text-chatwoot">
                Configuración Global API
              </h2>
              <p className="text-xs text-gray-500 mt-1">Configura tu URL base y credenciales una sola vez. Tus nodos de Webhook heredarán estos valores automáticamente (Patrón DRY).</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL Base Global</label>
                <input 
                  type="text" 
                  name="apiBaseUrl" 
                  value={formData.apiBaseUrl || ''} 
                  onChange={handleChange}
                  placeholder="Ej: https://api.aguacero.com"
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-chatwoot focus:border-chatwoot font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Credenciales Globales (API Keys)</label>
                <div className="space-y-2">
                  {Object.entries((() => {
                    let h = formData.apiHeaders;
                    if (typeof h === 'string') { try { h = JSON.parse(h); } catch(e) { h = {}; } }
                    return (typeof h === 'object' && h) ? h : {};
                  })()).map(([k, v]) => (
                    <div key={k} className="flex gap-2 items-center bg-white p-2 border border-gray-200 rounded">
                      <input type="text" value={k} readOnly className="w-1/3 bg-gray-50 border-none p-1.5 text-xs font-mono text-gray-500 rounded" />
                      <input type="password" value={v as string} readOnly className="flex-1 bg-gray-50 border-none p-1.5 text-xs text-gray-600 rounded" />
                      <button type="button" onClick={() => {
                        let currentH = formData.apiHeaders;
                        if (typeof currentH === 'string') { try { currentH = JSON.parse(currentH); } catch(e) { currentH = {}; } }
                        const h = { ...(typeof currentH === 'object' && currentH ? currentH : {}) };
                        delete h[k];
                        setFormData((prev: any) => ({...prev, apiHeaders: h}));
                      }} className="text-red-400 hover:text-red-600 font-bold px-2">✕</button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input type="text" id="global-new-key" placeholder="Nombre (Ej: x-api-key)" className="w-1/3 border border-gray-300 rounded p-1.5 text-xs focus:ring-chatwoot focus:border-chatwoot" />
                    <input type="password" id="global-new-val" placeholder="Contraseña o Token Secreto" className="flex-1 border border-gray-300 rounded p-1.5 text-xs focus:ring-chatwoot focus:border-chatwoot" />
                    <button type="button" onClick={() => {
                      const kInput = document.getElementById('global-new-key') as HTMLInputElement;
                      const vInput = document.getElementById('global-new-val') as HTMLInputElement;
                      if (kInput && vInput && kInput.value) {
                        let currentH = formData.apiHeaders;
                        if (typeof currentH === 'string') { try { currentH = JSON.parse(currentH); } catch(e) { currentH = {}; } }
                        const h = { ...(typeof currentH === 'object' && currentH ? currentH : {}), [kInput.value]: vInput.value };
                        setFormData((prev: any) => ({...prev, apiHeaders: h}));
                        kInput.value = '';
                        vInput.value = '';
                      }
                    }} className="bg-chatwoot text-white px-3 rounded text-xs font-bold hover:bg-chatwoot/90 transition-colors">+ Añadir</button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Estas credenciales se inyectarán de forma segura en todos tus webhooks.</p>
              </div>
            </div>
          </section>
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

          </div> )}

          {/* Botón de Guardado */}
          <div className="pt-4 border-t flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className={`bg-chatwoot hover:bg-blue-600 text-white px-8 py-3 rounded-lg shadow-sm font-bold text-base transition-colors flex items-center gap-2 cursor-pointer ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSaving ? (
                <><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Guardando...</>
              ) : (
                'Guardar y Aplicar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white flex items-center gap-2 transition-all transform duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.type === 'success' ? (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          ) : (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default App;
