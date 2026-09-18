const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "{activeTab === 'FLOW' && showFlowBuilder && (",
  "{showFlowBuilder && ("
);

code = code.replace(
  "{activeTab === 'AI' && showAiSettings && (",
  "{showAiSettings && ("
);

fs.writeFileSync(path, code, 'utf8');
console.log("Fixed tab buttons");
