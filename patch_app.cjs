const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

// 1. Añadir apiBaseUrl y apiHeaders a types (si es que existe un types, pero en App no hay type formData, es un state generico).
// Asumiendo que es un objeto dinámico. Solo necesitamos agregarlo a la UI.

const oldSystemTab = `{/* SECCIÓN 4: Mensajes Generales del Sistema */}
          {activeTab === 'SYSTEM' && ( <div className="space-y-8">`;

const newSystemTab = `{/* SECCIÓN 4: Mensajes Generales del Sistema */}
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Headers / Credenciales Globales (JSON)</label>
                <textarea 
                  name="apiHeaders" 
                  value={typeof formData.apiHeaders === 'object' ? JSON.stringify(formData.apiHeaders) : (formData.apiHeaders || '')} 
                  onChange={(e) => {
                     try {
                        const val = e.target.value ? JSON.parse(e.target.value) : undefined;
                        setFormData(prev => ({...prev, apiHeaders: val}));
                     } catch(e) {
                        setFormData(prev => ({...prev, apiHeaders: e.target.value}));
                     }
                  }}
                  placeholder='{"x-api-key": "secreto"}'
                  rows={2}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-chatwoot focus:border-chatwoot font-mono"
                />
                <p className="text-[10px] text-gray-400 mt-1">Escribe en formato JSON válido. Se inyectará en todas tus llamadas a Webhooks o IA.</p>
              </div>
            </div>
          </section>`;

code = code.replace(oldSystemTab, newSystemTab);

// 2. Modificar el Nodo Webhook para indicar herencia y cambiar el placeholder.
const oldUrlInput = `<label className="text-xs font-semibold text-gray-500 uppercase">URL del API:</label>
                <input type="text" value={node.url || ''} onChange={(e) => updateNodeType(node.id, 'WEBHOOK', { url: e.target.value })} placeholder="https://api.tudominio.com/..." className="w-full border rounded p-2 text-sm mt-1" />`;

const newUrlInput = `<label className="text-xs font-semibold text-gray-500 uppercase">URL (Ruta o Completa):</label>
                <input type="text" value={node.url || ''} onChange={(e) => updateNodeType(node.id, 'WEBHOOK', { url: e.target.value })} placeholder="Ej: /pedidos o https://api..." className="w-full border rounded p-2 text-sm mt-1 focus:border-chatwoot font-mono" />
                <p className="text-[10px] text-gray-400 mt-1">Si empieza con "/" se unirá a la URL Base Global automáticamente.</p>`;

code = code.replace(oldUrlInput, newUrlInput);

const oldHeaderLabel = `<label className="text-xs font-bold text-gray-500 uppercase block mb-2">Credenciales o Headers (Opcional):</label>`;
const newHeaderLabel = `<label className="text-xs font-bold text-gray-500 uppercase block mb-2">Credenciales Extra (Opcional): <span className="text-chatwoot normal-case font-normal">*Hereda globales*</span></label>`;

code = code.replace(oldHeaderLabel, newHeaderLabel);

fs.writeFileSync(appPath, code, 'utf8');
