const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

// 1. Add DYNAMIC_MENU to the select options
const oldOptions = `<option value="MENU">Sub-Menú de Opciones</option>
              <option value="INPUT">Solicitar Dato (Input)</option>
              <option value="WEBHOOK">Llamada a API (Webhook)</option>`;

const newOptions = `<option value="MENU">Sub-Menú de Opciones</option>
              <option value="DYNAMIC_MENU">Selector Dinámico (Desde API)</option>
              <option value="INPUT">Solicitar Dato (Input)</option>
              <option value="WEBHOOK">Llamada a API (Webhook)</option>`;

code = code.replace(oldOptions, newOptions);

// 2. Add UI renderer for DYNAMIC_MENU
const inputUI = `{node.type === 'INPUT' && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase">Guardar respuesta en variable:</label>
                <input type="text" value={node.variableName || ''} onChange={(e) => updateNodeType(node.id, 'INPUT', { variableName: e.target.value })} placeholder="Ej: nombre_cliente" className="w-full border rounded p-2 text-sm mt-1 focus:ring-chatwoot focus:border-chatwoot" />
              </div>
            )}`;

const dynamicUI = `{node.type === 'INPUT' && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase">Guardar respuesta en variable:</label>
                <input type="text" value={node.variableName || ''} onChange={(e) => updateNodeType(node.id, 'INPUT', { variableName: e.target.value })} placeholder="Ej: nombre_cliente" className="w-full border rounded p-2 text-sm mt-1 focus:ring-chatwoot focus:border-chatwoot" />
              </div>
            )}

            {node.type === 'DYNAMIC_MENU' && (
              <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-purple-700 uppercase">1. Variable del Arreglo (JSON)</label>
                  <p className="text-[10px] text-purple-500 mb-1">El nombre de la lista devuelta por el Webhook.</p>
                  <input type="text" value={node.arrayVariable || ''} onChange={(e) => updateNodeType(node.id, 'DYNAMIC_MENU', { arrayVariable: e.target.value })} placeholder="Ej: catalogo" className="w-full border-purple-300 rounded p-2 text-sm focus:ring-purple-500 font-mono" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-purple-700 uppercase">2. Plantilla del Botón</label>
                  <p className="text-[10px] text-purple-500 mb-1">Usa {{llave}} para leer datos del arreglo.</p>
                  <input type="text" value={node.titleTemplate || ''} onChange={(e) => updateNodeType(node.id, 'DYNAMIC_MENU', { titleTemplate: e.target.value })} placeholder="Ej: {{nombre}} - $\{{precio}}" className="w-full border-purple-300 rounded p-2 text-sm focus:ring-purple-500" />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-purple-700 uppercase">3. Llave a Guardar</label>
                    <input type="text" value={node.valueKey || ''} onChange={(e) => updateNodeType(node.id, 'DYNAMIC_MENU', { valueKey: e.target.value })} placeholder="Ej: id" className="w-full border-purple-300 rounded p-2 text-sm mt-1 focus:ring-purple-500 font-mono" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-purple-700 uppercase">4. Guardar en Variable</label>
                    <input type="text" value={node.variableName || ''} onChange={(e) => updateNodeType(node.id, 'DYNAMIC_MENU', { variableName: e.target.value })} placeholder="Ej: producto_id" className="w-full border-purple-300 rounded p-2 text-sm mt-1 focus:ring-purple-500 font-mono" />
                  </div>
                </div>
              </div>
            )}`;

code = code.replace(inputUI, dynamicUI);

// 3. Render connection box correctly for DYNAMIC_MENU
const oldSuccessBox = `{(node.type === 'INPUT' || node.type === 'WEBHOOK') && (
              <div className={node.type === 'WEBHOOK' ? "flex flex-col md:flex-row gap-4" : ""}>`;

const newSuccessBox = `{(node.type === 'INPUT' || node.type === 'WEBHOOK' || node.type === 'DYNAMIC_MENU') && (
              <div className={node.type === 'WEBHOOK' ? "flex flex-col md:flex-row gap-4" : ""}>`;

code = code.replace(oldSuccessBox, newSuccessBox);

// 4. Update TS type if it exists (usually inside App.tsx or types.ts).
// Wait, my previous script injected fields to FlowNode. Let's make sure it's updated.
const oldType = `successNodeId?: string;
  errorNodeId?: string;
}`;

const newType = `successNodeId?: string;
  errorNodeId?: string;
  arrayVariable?: string;
  titleTemplate?: string;
  valueKey?: string;
}`;

if (code.includes('interface FlowNode')) {
   code = code.replace(oldType, newType);
}

fs.writeFileSync(appPath, code, 'utf8');
