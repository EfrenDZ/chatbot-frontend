const fs = require('fs');
const pathContext = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/hooks/useChatwootContext.ts';
let codeContext = fs.readFileSync(pathContext, 'utf8');

if (!codeContext.includes("declare global")) {
  codeContext = `declare global {\n  interface Window {\n    chatwootIframeActive: boolean;\n  }\n}\n` + codeContext;
  fs.writeFileSync(pathContext, codeContext, 'utf8');
}
console.log("Window TS patched");
