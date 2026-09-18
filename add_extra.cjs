const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const extraField = `
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
`;

// Insert after the "Reglas Especiales" block ends. We can find:
// className="text-xs text-chatwoot font-bold">+ Agregar Regla</button>\n                        </div>
code = code.replace(
  'className="text-xs text-chatwoot font-bold">+ Agregar Regla</button>\n                        </div>',
  'className="text-xs text-chatwoot font-bold">+ Agregar Regla</button>\n                        </div>' + extraField
);

fs.writeFileSync(path, code, 'utf8');
console.log("Added extraContext");
