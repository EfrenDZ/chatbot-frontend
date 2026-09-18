const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "{/* SECCIÓN 2: Constructor de Flujos (Condicional: OPTIONS o HYBRID) */}\n          {showFlowBuilder && (",
  "{/* SECCIÓN 2: Constructor de Flujos (Condicional: OPTIONS o HYBRID) */}\n          {activeTab === 'FLOW' && showFlowBuilder && ("
);

code = code.replace(
  "{/* SECCIÓN 3: Configuración de Inteligencia Artificial (Condicional: AI o HYBRID) */}\n          {showAiSettings && (",
  "{/* SECCIÓN 3: Configuración de Inteligencia Artificial (Condicional: AI o HYBRID) */}\n          {activeTab === 'AI' && showAiSettings && ("
);

fs.writeFileSync(path, code, 'utf8');
console.log("Fixed sections");
