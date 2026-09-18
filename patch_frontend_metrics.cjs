const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add Dashboard to activeTab state
code = code.replace(
  "const [activeTab, setActiveTab] = useState<'FLOW' | 'AI' | 'SYSTEM'>('FLOW');",
  "const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'FLOW' | 'AI' | 'SYSTEM'>('DASHBOARD');\n  const [metrics, setMetrics] = useState<any>(null);"
);

// 2. Fetch metrics
const fetchMetricsCode = `      fetch(\`/api/config/\${accountId}/metrics\`)
        .then(res => res.json())
        .then(data => setMetrics(data))
        .catch(err => console.error('Error cargando métricas:', err));
`;
code = code.replace(
  "setConfig(data);",
  "setConfig(data);\n" + fetchMetricsCode
);

// 3. Add Dashboard Tab Button
const dashboardTabBtn = `
              <button
                type="button"
                onClick={() => setActiveTab('DASHBOARD')}
                className={\`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm \${
                  activeTab === 'DASHBOARD'
                    ? 'border-chatwoot text-chatwoot'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Métricas (Últimos 30 días)
                </div>
              </button>
`;

code = code.replace(
  '<nav className="-mb-px flex space-x-6" aria-label="Tabs">',
  '<nav className="-mb-px flex space-x-6" aria-label="Tabs">\n' + dashboardTabBtn
);

// 4. Add Dashboard Section Content
const dashboardSection = `
          {/* SECCIÓN 0: DASHBOARD */}
          {activeTab === 'DASHBOARD' && (
            <section className="space-y-6">
              <div className="border-b pb-2">
                <h2 className="text-base font-bold text-gray-900 text-chatwoot">Panel de Rendimiento (Últimos 30 Días)</h2>
                <p className="text-xs text-gray-500 mt-0.5">Métricas de impacto del asistente virtual en tu operación.</p>
              </div>

              {!metrics ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chatwoot"></div></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Conversaciones</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalSessions}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Atendidas por el bot</p>
                  </div>
                  
                  <div className="bg-white border border-green-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-xs font-bold text-green-600 uppercase">Resueltas por IA</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.resolvedSessions}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Sin ayuda humana</p>
                  </div>

                  <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <svg className="w-16 h-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <p className="text-xs font-bold text-amber-600 uppercase">Transferidas a Humanos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.handedOffSessions}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Requieren atención</p>
                  </div>

                  <div className="bg-white border border-purple-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <svg className="w-16 h-16 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <p className="text-xs font-bold text-purple-600 uppercase">Mensajes IA Consumidos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.aiMessagesConsumed}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Respuestas generadas</p>
                  </div>
                </div>
              )}
            </section>
          )}
`;

code = code.replace(
  "{/* SECCIÓN 2: Constructor de Flujos (Condicional: OPTIONS o HYBRID) */}",
  dashboardSection + "\n\n          {/* SECCIÓN 2: Constructor de Flujos (Condicional: OPTIONS o HYBRID) */}"
);

fs.writeFileSync(path, code, 'utf8');
console.log("Frontend patched");
