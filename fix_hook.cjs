const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

// Remove the offending useEffect
code = code.replace(
  "  useEffect(() => { if (botMode === 'OPTIONS' && activeTab === 'AI') setActiveTab('FLOW'); if (botMode === 'AI' && activeTab === 'FLOW') setActiveTab('AI'); }, [botMode, activeTab]);\n",
  ""
);

// Insert it BEFORE the early return
code = code.replace(
  "  if (isLoading || !formData) {",
  "  const botMode = formData?.botMode || 'HYBRID';\n  useEffect(() => { if (botMode === 'OPTIONS' && activeTab === 'AI') setActiveTab('FLOW'); if (botMode === 'AI' && activeTab === 'FLOW') setActiveTab('AI'); }, [botMode, activeTab]);\n\n  if (isLoading || !formData) {"
);

fs.writeFileSync(path, code, 'utf8');
console.log("Fixed hooks");
