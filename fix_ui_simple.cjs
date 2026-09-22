const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

const targetAnchor = "          {node.type === 'INPUT' && (";
const endIndex = code.indexOf(targetAnchor);
if (endIndex === -1) {
    console.log("Could not find anchor");
    process.exit(1);
}

// Find the end of this block. It ends with: `</div>\n          )}`
const endOfBlock = code.indexOf("          )}", endIndex + 10);
if (endOfBlock === -1) {
    console.log("Could not find end of block");
    process.exit(1);
}

const insertionPoint = endOfBlock + 13; // length of "          )}\n"

const dynamicUI = `
          {node.type === 'DYNAMIC_MENU' && (
            <div className="mt-4 border-t border-purple-100 pt-4 bg-purple-50/30 -mx-4 px-4 pb-4 rounded-b-xl">
              <h4 className="text-xs font-bold text-purple-700 uppercase mb-3 flex items-center gap-2">
                Configuración del Selector Dinámico
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">1. Variable del Arreglo (JSON)</label>
                  <input type="text" value={node.arrayVariable || ''} onChange={(e) => updateNodeType(node.id, 'DYNAMIC_MENU', { arrayVariable: e.target.value })} placeholder="Ej: catalogo" className="w-full border border-purple-200 rounded p-2 text-sm focus:ring-purple-500 font-mono" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">2. Plantilla del Botón</label>
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

code = code.slice(0, insertionPoint) + dynamicUI + code.slice(insertionPoint);
fs.writeFileSync(appPath, code, 'utf8');
