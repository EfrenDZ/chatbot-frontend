const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update NodeType
code = code.replace(
  "type NodeType = 'MENU' | 'MESSAGE' | 'AI' | 'HANDOFF';",
  "type NodeType = 'MENU' | 'MESSAGE' | 'AI' | 'HANDOFF' | 'RESTART' | 'RESOLVE';"
);

// 2. Update node select dropdown
const oldSelect = `<select
                  value={node.type}
                  onChange={(e) => updateNode(node.id, { type: e.target.value as NodeType })}
                  className="border rounded text-sm p-1.5 focus:ring-chatwoot focus:border-chatwoot outline-none cursor-pointer"
                >
                  <option value="MESSAGE">Mensaje</option>
                  <option value="MENU">Menú de Opciones</option>
                  <option value="HANDOFF">Transferir a Humano</option>
                  <option value="AI">Responder con IA</option>
                </select>`;
const newSelect = `<select
                  value={node.type}
                  onChange={(e) => updateNode(node.id, { type: e.target.value as NodeType })}
                  className="border rounded text-sm p-1.5 focus:ring-chatwoot focus:border-chatwoot outline-none cursor-pointer"
                >
                  <option value="MESSAGE">Mensaje Simple</option>
                  <option value="MENU">Menú de Opciones</option>
                  <option value="RESTART">Volver al Menú Principal</option>
                  <option value="RESOLVE">Cerrar Chat (Resolver)</option>
                  <option value="HANDOFF">Transferir a Humano</option>
                  <option value="AI">Responder con IA</option>
                </select>`;
code = code.replace(oldSelect, newSelect);

// 3. Hide Textarea and Options button if RESTART or RESOLVE
const oldTextarea = `<div className="mt-3">
              <label className="block text-xs uppercase font-bold text-gray-500 mb-1">
                {node.type === 'MENU' ? 'Texto del Menú' : 'Mensaje'}
              </label>
              <textarea
                rows={2}
                value={node.text}
                onChange={(e) => updateNode(node.id, { text: e.target.value })}
                className="w-full border rounded p-2 text-sm focus:ring-chatwoot focus:border-chatwoot outline-none resize-y"
                placeholder={node.type === 'MENU' ? 'Ej: ¿Qué deseas hacer?' : 'Ej: Gracias por tu mensaje...'}
              />
            </div>`;

const newTextarea = `{node.type !== 'RESTART' && node.type !== 'RESOLVE' && (
            <div className="mt-3">
              <label className="block text-xs uppercase font-bold text-gray-500 mb-1">
                {node.type === 'MENU' ? 'Texto del Menú' : 'Mensaje'}
              </label>
              <textarea
                rows={2}
                value={node.text}
                onChange={(e) => updateNode(node.id, { text: e.target.value })}
                className="w-full border rounded p-2 text-sm focus:ring-chatwoot focus:border-chatwoot outline-none resize-y"
                placeholder={node.type === 'MENU' ? 'Ej: ¿Qué deseas hacer?' : 'Ej: Gracias por tu mensaje...'}
              />
            </div>
)}
{node.type === 'RESTART' && <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">↺ Al llegar aquí, el bot reiniciará la sesión y enviará el Menú Principal.</div>}
{node.type === 'RESOLVE' && <div className="mt-3 text-sm text-green-600 bg-green-50 p-2 rounded border border-green-100">✓ Al llegar aquí, el bot marcará la conversación como Resuelta en Chatwoot.</div>}`;
code = code.replace(oldTextarea, newTextarea);

fs.writeFileSync(path, code, 'utf8');
console.log("App.tsx patched for new nodes");
