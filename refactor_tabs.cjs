const fs = require('fs');

const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add activeTab state
code = code.replace(
  "const [rootNodeId, setRootNodeId] = useState<string>('node-root');",
  "const [rootNodeId, setRootNodeId] = useState<string>('node-root');\n  const [activeTab, setActiveTab] = useState<'FLOW' | 'AI' | 'SYSTEM'>('FLOW');"
);

// 2. Add Tab UI after Section 1
const tabUI = `
          {/* NAVEGACIÓN POR PESTAÑAS */}
          <div className="border-b border-gray-200 mt-8 mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {(botMode === 'OPTIONS' || botMode === 'HYBRID') && (
                <button
                  type="button"
                  onClick={() => setActiveTab('FLOW')}
                  className={\`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm \${
                    activeTab === 'FLOW'
                      ? 'border-chatwoot text-chatwoot'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }\`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    Constructor de Flujo
                  </div>
                </button>
              )}
              
              {(botMode === 'AI' || botMode === 'HYBRID') && (
                <button
                  type="button"
                  onClick={() => { setActiveTab('AI'); }}
                  className={\`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm \${
                    activeTab === 'AI'
                      ? 'border-chatwoot text-chatwoot'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }\`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Conocimiento de IA
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('SYSTEM')}
                className={\`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm \${
                  activeTab === 'SYSTEM'
                    ? 'border-chatwoot text-chatwoot'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Mensajes y Ajustes
                </div>
              </button>
            </nav>
          </div>
`;

// Make sure tab logic correctly overrides active tab if switching botMode
const botModeLogic = `
                <div
                  onClick={() => {
                    setFormData({...formData, botMode: 'OPTIONS'});
                    if (activeTab === 'AI') setActiveTab('FLOW');
                  }}
`;
// Update botMode logic replacing setFormData({...formData, botMode: 'OPTIONS'}) etc.
code = code.replace(/setFormData\(\{...formData, botMode: 'OPTIONS'\}\)/g, "setFormData({...formData, botMode: 'OPTIONS'}); if (activeTab === 'AI') setActiveTab('FLOW');");
code = code.replace(/setFormData\(\{...formData, botMode: 'AI'\}\)/g, "setFormData({...formData, botMode: 'AI'}); if (activeTab === 'FLOW') setActiveTab('AI');");

// Insert tabs UI before Section 2
code = code.replace("{/* SECCIÓN 2: Constructor de Flujos (Condicional: OPTIONS o HYBRID) */}", tabUI + "\n          {/* SECCIÓN 2: Constructor de Flujos (Condicional: OPTIONS o HYBRID) */}");

// Wrap Section 2 in activeTab
code = code.replace(
  "{(botMode === 'OPTIONS' || botMode === 'HYBRID') && (",
  "{activeTab === 'FLOW' && (botMode === 'OPTIONS' || botMode === 'HYBRID') && ("
);

// Wrap Section 3 in activeTab
code = code.replace(
  "{(botMode === 'AI' || botMode === 'HYBRID') && (",
  "{activeTab === 'AI' && (botMode === 'AI' || botMode === 'HYBRID') && ("
);

// Wrap Section 4 in activeTab
code = code.replace(
  "{/* SECCIÓN 4: Mensajes Generales del Sistema */}",
  "{/* SECCIÓN 4: Mensajes Generales del Sistema */}\n          {activeTab === 'SYSTEM' && ( <div className=\"space-y-8\">"
);

// Add the closing tag for Section 4 wrapper right before the save button
code = code.replace(
  "          {/* Botón de Guardar General */}",
  "          </div> )}\n\n          {/* Botón de Guardar General */}"
);

fs.writeFileSync(path, code, 'utf8');
console.log("Refactoring complete");
