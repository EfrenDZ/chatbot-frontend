const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "  const botMode = formData.botMode || 'HYBRID';\n",
  ""
);

fs.writeFileSync(path, code, 'utf8');
console.log("Fixed redecl");
