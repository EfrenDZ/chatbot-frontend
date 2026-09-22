const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

const oldRender = `{node.targetNodeId && renderNode(node.targetNodeId, depth + 1, false)}`;
const newRender = `{node.targetNodeId ? renderNode(node.targetNodeId, depth + 1, false) : (
                  <button 
                    type="button" 
                    onClick={() => {
                      const newId = \`node-\${Date.now()}\`;
                      setNodes(prev => {
                        const newNodes = [...prev, { id: newId, type: 'MESSAGE' as NodeType, text: 'Siguiente paso...', messages: ['Siguiente paso...'] }];
                        return newNodes.map(n => n.id === node.id ? { ...n, targetNodeId: newId } : n);
                      });
                    }}
                    className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-bold py-2 px-4 rounded border border-purple-200 transition-colors mt-2"
                  >
                    + Añadir Siguiente Paso
                  </button>
                )}`;

code = code.replace(oldRender, newRender);

fs.writeFileSync(appPath, code, 'utf8');
