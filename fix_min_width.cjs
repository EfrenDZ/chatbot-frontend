const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

const oldRenderDef = "className={`relative ${isRoot ? '' : 'pl-6 border-l-2 border-gray-200 ml-4 mt-4'}`}";
const newRenderDef = "className={`relative min-w-[400px] ${isRoot ? '' : 'pl-6 border-l-2 border-gray-200 ml-4 mt-4'}`}";

code = code.replace(oldRenderDef, newRenderDef);

fs.writeFileSync(appPath, code, 'utf8');
