const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

const regex = /\{node\.type === 'INPUT' && \([\s\S]*?\}\s*onChange=\{\(e\) => \{\s*setNodes[\s\S]*?\}\} placeholder="ej\. cantidad_garrafones" className="w-full border rounded p-2 text-sm mt-1" \/>\s*<\/div>\s*<\/div>\s*<p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Siguiente Paso:<\/p>\s*<select[\s\S]*?<\/select>\s*<\/div>\s*\)\}/;

const match = code.match(regex);
if (match) {
    const originalInput = match[0];
    const dynamicUI = `
          {node.type === 'DYNAMIC_MENU' && (
            <div className="mt-4 border-t border-purple-100 pt-4 bg-purple-50/30 -mx-4 px-4 pb-4 rounded-b-xl">
              <h4 className="text-xs font-bold text-purple-700 uppercase mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                Configuración del Selector Dinámico
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">1. Variable del Arreglo (JSON)</label>
                  <p className="text-[10px] text-gray-500 mb-1">El nombre de la lista devuelta por el Webhook.</p>
                  <input type="text" value={node.arrayVariable || ''} onChange={(e) => updateNodeType(node.id, 'DYNAMIC_MENU', { arrayVariable: e.target.value })} placeholder="Ej: catalogo" className="w-full border border-purple-200 rounded p-2 text-sm focus:ring-purple-500 font-mono" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">2. Plantilla del Botón</label>
                  <p className="text-[10px] text-gray-500 mb-1">Usa {{llave}} para leer datos de cada elemento.</p>
                  <input type="text" value={node.titleTemplate || ''} onChange={(e) => updateNodeType(node.id, 'DYNAMIC_MENU', { titleTemplate: e.target.value })} placeholder="Ej: {{nombre}} - $\{{precio}}" className="w-full border border-purple-200 rounded p-2 text-sm focus:ring-purple-500" />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-700 uppercase">3. Llave a Guardar</label>
                    <input type="text" value={node.valueKey || ''} onChange={(e) => updateNodeType(node.id, 'DYNAMIC_MENU', { valueKey: e.target.value })} placeholder="Ej: id" className="w-full border border-purple-200 rounded p-2 text-sm mt-1 focus:ring-purple-500 font-mono" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-700 uppercase">4. Guardar en Variable</label>
                    <input type="text" value={node.variableName || ''} onChange={(e) => updateNodeType(node.id, 'DYNAMIC_MENU', { variableName: e.target.value })} placeholder="Ej: producto_id" className="w-full border border-purple-200 rounded p-2 text-sm mt-1 focus:ring-purple-500 font-mono" />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">Siguiente Paso (Después de elegir):</p>
                <select
                  value={node.targetNodeId || ''}
                  onChange={(e) => updateNodeType(node.id, 'DYNAMIC_MENU', { targetNodeId: e.target.value })}
                  className="w-full border border-purple-200 rounded p-2 text-sm font-medium"
                >
                  <option value="">-- Finalizar conversación --</option>
                  {arr.filter(n => n.id !== node.id).map(n => (
                    <option key={n.id} value={n.id}>Ir a: {n.type} ({n.id.substring(0, 4)})</option>
                  ))}
                </select>
              </div>
            </div>
          )}
`;
    code = code.replace(originalInput, originalInput + '\n' + dynamicUI);
    fs.writeFileSync(appPath, code, 'utf8');
} else {
    console.log("Could not match the INPUT UI regex.");
}

