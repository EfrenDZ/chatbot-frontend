const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

code = code.replace(
  "type NodeType = 'MENU' | 'MESSAGE' | 'AI' | 'HANDOFF' | 'RESTART' | 'RESOLVE' | 'INPUT' | 'WEBHOOK';",
  "type NodeType = 'MENU' | 'MESSAGE' | 'AI' | 'HANDOFF' | 'RESTART' | 'RESOLVE' | 'INPUT' | 'WEBHOOK' | 'DYNAMIC_MENU';"
);

fs.writeFileSync(appPath, code, 'utf8');
