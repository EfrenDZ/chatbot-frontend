const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const timeoutField = `
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  Tiempo de expiración de sesión (Horas)
                </label>
                <input 
                  type="number" 
                  name="sessionTimeoutHours" 
                  value={formData.sessionTimeoutHours || 24} 
                  onChange={handleChange}
                  min={1}
                  max={72}
                  className="w-full md:w-1/3 border border-gray-300 rounded p-2 text-sm focus:ring-chatwoot focus:border-chatwoot"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tiempo de inactividad antes de que el bot reinicie el menú si el cliente vuelve a escribir. Chatwoot también puede tener su propia regla global.
                </p>
              </div>
`;

code = code.replace(
  '<h2 className="text-base font-bold text-gray-900 text-chatwoot">\n                Mensajes del Sistema\n              </h2>\n            </div>\n\n            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">',
  '<h2 className="text-base font-bold text-gray-900 text-chatwoot">\n                Mensajes del Sistema\n              </h2>\n            </div>\n\n            <div className="space-y-4 border-b pb-4 mb-4">' + timeoutField + '</div>\n\n            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">'
);

fs.writeFileSync(path, code, 'utf8');
console.log("Frontend timeout patched");
