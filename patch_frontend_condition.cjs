const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

// 1. NodeType
code = code.replace(
  "type NodeType = 'MENU' | 'MESSAGE' | 'AI' | 'HANDOFF' | 'RESTART' | 'RESOLVE' | 'INPUT' | 'WEBHOOK' | 'DYNAMIC_MENU';",
  "type NodeType = 'MENU' | 'MESSAGE' | 'AI' | 'HANDOFF' | 'RESTART' | 'RESOLVE' | 'INPUT' | 'WEBHOOK' | 'DYNAMIC_MENU' | 'CONDITION';"
);

// 2. FlowNode Interface
const oldFlowNode = `  errorNodeId?: string;
  arrayVariable?: string;
  titleTemplate?: string;
  valueKey?: string;
}`;

const newFlowNode = `  errorNodeId?: string;
  arrayVariable?: string;
  titleTemplate?: string;
  valueKey?: string;
  conditionVariable?: string;
  conditionOperator?: 'exists' | 'equals';
  conditionValue?: string;
}`;
code = code.replace(oldFlowNode, newFlowNode);

// 3. Select options
const oldSelect = `<option value="WEBHOOK">Llamada a API (Webhook)</option>`;
const newSelect = `<option value="WEBHOOK">Llamada a API (Webhook)</option>
              <option value="CONDITION">Condición Lógica (IF/ELSE)</option>`;
code = code.replace(oldSelect, newSelect);

// 4. updateNodeType initialization
const oldUpdate = `if (type === 'WEBHOOK') {`;
const newUpdate = `if (type === 'WEBHOOK' || type === 'CONDITION') {`;
code = code.replace(oldUpdate, newUpdate);

// 5. renderNode UI
const oldUIAnchor = `{node.type === 'WEBHOOK' && (`;

const conditionUI = `
          {node.type === 'CONDITION' && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                <h4 className="text-xs font-bold text-orange-700 uppercase mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                  Evaluador Lógico
                </h4>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-700 uppercase whitespace-nowrap">Variable a Evaluar</label>
                    <input type="text" value={node.conditionVariable || ''} onChange={(e) => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, conditionVariable: e.target.value } : n))} placeholder="Ej: cliente.direccion" className="w-full border border-orange-200 rounded p-2 text-sm mt-1 focus:ring-orange-500 font-mono" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-700 uppercase whitespace-nowrap">Condición</label>
                    <select value={node.conditionOperator || 'exists'} onChange={(e) => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, conditionOperator: e.target.value as 'exists' | 'equals' } : n))} className="w-full border border-orange-200 rounded p-2 text-sm mt-1 focus:ring-orange-500 font-medium bg-white">
                      <option value="exists">Existe (No está vacío)</option>
                      <option value="equals">Es igual a...</option>
                    </select>
                  </div>
                  {node.conditionOperator === 'equals' && (
                    <div className="flex-1">
                      <label className="text-xs font-bold text-gray-700 uppercase whitespace-nowrap">Valor de Comparación</label>
                      <input type="text" value={node.conditionValue || ''} onChange={(e) => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, conditionValue: e.target.value } : n))} placeholder="Ej: CDMX" className="w-full border border-orange-200 rounded p-2 text-sm mt-1 focus:ring-orange-500" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 items-start">
                <div className="border border-green-200 bg-green-50/30 rounded p-3 min-w-[350px] flex-1 flex-shrink-0">
                  <p className="text-xs font-bold text-green-600 mb-2 uppercase">Si CUMPLE (TRUE):</p>
                  {node.successNodeId && renderNode(node.successNodeId, depth + 1, false)}
                </div>
                <div className="border border-red-200 bg-red-50/30 rounded p-3 min-w-[350px] flex-1 flex-shrink-0">
                  <p className="text-xs font-bold text-red-600 mb-2 uppercase">Si NO CUMPLE (FALSE):</p>
                  {node.errorNodeId && renderNode(node.errorNodeId, depth + 1, false)}
                </div>
              </div>
            </div>
          )}

          {node.type === 'WEBHOOK' && (`;

code = code.replace(oldUIAnchor, conditionUI);

fs.writeFileSync(appPath, code, 'utf8');
