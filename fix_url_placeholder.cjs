const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

const regex = /<label className="text-xs font-semibold text-gray-500 uppercase">URL del API:<\/label>\s*<input type="text" value=\{node\.url \|\| ''\} onChange=\{\(e\) => updateNodeType\(node\.id, 'WEBHOOK', \{ url: e\.target\.value \}\)\} placeholder="https:\/\/api\.tudominio\.com\/\.\.\." className="w-full border rounded p-2 text-sm mt-1" \/>/;

const replacement = `<label className="text-xs font-semibold text-gray-500 uppercase">Ruta / Endpoint:</label>
                <input type="text" value={node.url || ''} onChange={(e) => updateNodeType(node.id, 'WEBHOOK', { url: e.target.value })} placeholder="Ej: ?action=crear_pedido" className="w-full border rounded p-2 text-sm mt-1 focus:border-chatwoot font-mono bg-blue-50" />
                <p className="text-[10px] text-blue-500 mt-1 font-semibold">Se unirá a tu URL Base Global automáticamente.</p>`;

code = code.replace(regex, replacement);
fs.writeFileSync(appPath, code, 'utf8');
