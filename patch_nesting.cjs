const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

// 1. Fix `updateNodeType` to auto-create targetNodeId for DYNAMIC_MENU
const oldUpdate = `if (type === 'INPUT' && !n.targetNodeId) {
        const targetId = \`node-\${Date.now()}\`;
        n.targetNodeId = targetId;
        newNodes.push({ id: targetId, type: 'MESSAGE', text: 'Respuesta...', messages: ['Respuesta...'] });
      }`;

const newUpdate = `if ((type === 'INPUT' || type === 'DYNAMIC_MENU') && !n.targetNodeId) {
        const targetId = \`node-\${Date.now()}\`;
        n.targetNodeId = targetId;
        newNodes.push({ id: targetId, type: 'MESSAGE', text: 'Respuesta...', messages: ['Respuesta...'] });
      }`;

code = code.replace(oldUpdate, newUpdate);

// 2. Remove the confusing <select> and replace it with the recursive renderNode call.
const oldUISelectRegex = /<div className="mt-6">\s*<p className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">Siguiente Paso \(Después de elegir\):<\/p>\s*<select[\s\S]*?<\/select>\s*<\/div>/;

const newUIRender = `<div className="mt-6">
                <p className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">Siguiente Paso (Después de elegir):</p>
                {node.targetNodeId && renderNode(node.targetNodeId, depth + 1, false)}
              </div>`;

code = code.replace(oldUISelectRegex, newUIRender);

fs.writeFileSync(appPath, code, 'utf8');
