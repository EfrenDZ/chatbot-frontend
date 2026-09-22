const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

code = code.replace(
  "type: 'MESSAGE', text:",
  "type: 'MESSAGE' as NodeType, text:"
);

fs.writeFileSync(appPath, code, 'utf8');
