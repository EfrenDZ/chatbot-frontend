const fs = require('fs');
let code = fs.readFileSync('/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx', 'utf8');
code = code.replace("import type { NodeType, FlowNode, FlowOption } from './types';", "import type { FlowNode } from './types';");
fs.writeFileSync('/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx', code, 'utf8');
