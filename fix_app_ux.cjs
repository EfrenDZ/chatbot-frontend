const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

const oldTextArea = `              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Headers / Credenciales Globales (JSON)</label>
                <textarea 
                  name="apiHeaders" 
                  value={typeof formData.apiHeaders === 'object' ? JSON.stringify(formData.apiHeaders) : (formData.apiHeaders || '')} 
                  onChange={(e) => {
                     const inputValue = e.target.value;
                     try {
                        const val = inputValue ? JSON.parse(inputValue) : undefined;
                        setFormData((prev: any) => ({...prev, apiHeaders: val}));
                     } catch(err) {
                        setFormData((prev: any) => ({...prev, apiHeaders: inputValue}));
                     }
                  }}
                  placeholder='{"x-api-key": "secreto"}'
                  rows={2}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-chatwoot focus:border-chatwoot font-mono"
                />
                <p className="text-[10px] text-gray-400 mt-1">Escribe en formato JSON válido. Se inyectará en todas tus llamadas a Webhooks o IA.</p>
              </div>`;

const newKeyVal = `              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Credenciales Globales (API Keys)</label>
                <div className="space-y-2">
                  {Object.entries(typeof formData.apiHeaders === 'object' && formData.apiHeaders ? formData.apiHeaders : {}).map(([k, v]) => (
                    <div key={k} className="flex gap-2 items-center bg-white p-2 border border-gray-200 rounded">
                      <input type="text" value={k} readOnly className="w-1/3 bg-gray-50 border-none p-1.5 text-xs font-mono text-gray-500 rounded" />
                      <input type="password" value={v as string} readOnly className="flex-1 bg-gray-50 border-none p-1.5 text-xs text-gray-600 rounded" />
                      <button type="button" onClick={() => {
                        const h = { ...(formData.apiHeaders as any) };
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
                        const h = { ...(typeof formData.apiHeaders === 'object' ? formData.apiHeaders : {}), [kInput.value]: vInput.value };
                        setFormData((prev: any) => ({...prev, apiHeaders: h}));
                        kInput.value = '';
                        vInput.value = '';
                      }
                    }} className="bg-chatwoot text-white px-3 rounded text-xs font-bold hover:bg-chatwoot/90 transition-colors">+ Añadir</button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Estas credenciales se inyectarán de forma segura en todos tus webhooks.</p>
              </div>`;

code = code.replace(oldTextArea, newKeyVal);
fs.writeFileSync(appPath, code, 'utf8');
