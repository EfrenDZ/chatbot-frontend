const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add state
const stateInjection = `  const [aiSubTab, setAiSubTab] = useState<'GENERAL' | 'CATALOG' | 'FAQS' | 'BRANCHES'>('GENERAL');

  const updateAiKnowledge = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      aiKnowledge: {
        ...(prev.aiKnowledge || {}),
        [key]: value
      }
    }));
  };
`;
if(!code.includes("aiSubTab")) {
  code = code.replace(
    "const [activeTab, setActiveTab] = useState<'FLOW' | 'AI' | 'SYSTEM'>('FLOW');",
    "const [activeTab, setActiveTab] = useState<'FLOW' | 'AI' | 'SYSTEM'>('FLOW');\n" + stateInjection
  );
}

const aiSectionHTML = `              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
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
                        className={\`text-left px-4 py-3 text-sm font-semibold transition-colors \${
                          aiSubTab === tab.id 
                            ? 'bg-blue-50 text-chatwoot border-l-4 border-chatwoot' 
                            : 'text-gray-600 hover:bg-gray-100 border-l-4 border-transparent'
                        }\`}
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
                            {(formData.aiKnowledge?.rules || []).map((rule, idx) => (
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
                                  const newRules = formData.aiKnowledge.rules.filter((_, i) => i !== idx);
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
                      </div>
                    )}

                    {aiSubTab === 'CATALOG' && (
                      <div>
                        <p className="text-xs text-gray-500 mb-4">Agrega los productos o servicios que la IA puede ofrecer o vender.</p>
                        <div className="space-y-4 mb-4">
                          {(formData.aiKnowledge?.catalog || []).map((item, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                              <button type="button" onClick={() => {
                                const newCat = formData.aiKnowledge.catalog.filter((_, i) => i !== idx);
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
                          {(formData.aiKnowledge?.faqs || []).map((faq, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                              <button type="button" onClick={() => {
                                const newFaqs = formData.aiKnowledge.faqs.filter((_, i) => i !== idx);
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
                          {(formData.aiKnowledge?.branches || []).map((branch, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                              <button type="button" onClick={() => {
                                const b = formData.aiKnowledge.branches.filter((_, i) => i !== idx);
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
              )}`;

const lines = code.split('\n');
const startIdx = lines.findIndex(l => l.includes('<div className="grid grid-cols-1 gap-5">'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('</section>'));

if(startIdx !== -1 && endIdx !== -1) {
  const newLines = [
    ...lines.slice(0, startIdx),
    aiSectionHTML,
    ...lines.slice(endIdx) // includes </section>
  ];
  fs.writeFileSync(path, newLines.join('\n'), 'utf8');
  console.log("Successfully injected AI section");
} else {
  console.log("Could not find boundaries", startIdx, endIdx);
}
