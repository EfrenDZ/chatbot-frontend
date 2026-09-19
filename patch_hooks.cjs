const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

// Eliminar el useEffect y botMode de su posicion actual
const badCode = `  const botMode = formData?.botMode || 'HYBRID';
  useEffect(() => { if (botMode === 'OPTIONS' && activeTab === 'AI') setActiveTab('FLOW'); if (botMode === 'AI' && activeTab === 'FLOW') setActiveTab('AI'); }, [botMode, activeTab]);`;

code = code.replace(badCode, "");

// Y ponerlo despues de las llamadas de los demas hooks (despues de los useStates)
const hookTarget = `const [aiSubTab, setAiSubTab] = useState<'GENERAL' | 'CATALOG' | 'FAQS' | 'BRANCHES'>('GENERAL');`;
const replacement = `const [aiSubTab, setAiSubTab] = useState<'GENERAL' | 'CATALOG' | 'FAQS' | 'BRANCHES'>('GENERAL');

  const botMode = formData?.botMode || 'HYBRID';
  useEffect(() => { 
    if (botMode === 'OPTIONS' && activeTab === 'AI') setActiveTab('FLOW'); 
    if (botMode === 'AI' && activeTab === 'FLOW') setActiveTab('AI'); 
  }, [botMode, activeTab]);`;

code = code.replace(hookTarget, replacement);

fs.writeFileSync(path, code, 'utf8');
console.log("Hooks order fixed");
