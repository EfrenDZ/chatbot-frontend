const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/\(rule, idx\)/g, '(rule: string, idx: number)');
code = code.replace(/\(item, idx\)/g, '(item: any, idx: number)');
code = code.replace(/\(faq, idx\)/g, '(faq: any, idx: number)');
code = code.replace(/\(branch, idx\)/g, '(branch: any, idx: number)');
code = code.replace(/\(\_, i\)/g, '(_: any, i: number)');

fs.writeFileSync(path, code, 'utf8');
console.log("Fixed TS implicit any");
