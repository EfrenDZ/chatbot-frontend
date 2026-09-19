const fs = require('fs');
const apiPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/services/api.ts';
let apiCode = fs.readFileSync(apiPath, 'utf8');

if (!apiCode.includes('iframeAutoLogin')) {
  const newApi = `  iframeAutoLogin: async (accountId: number) => {
    const response = await fetch(\`\${API_BASE_URL}/api/auth/iframe-bypass\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId }),
    });
    if (!response.ok) throw new Error('Bypass falló');
    return response.json();
  },
`;
  apiCode = apiCode.replace("getMetrics: async (accountId: number) => {", newApi + "  getMetrics: async (accountId: number) => {");
  fs.writeFileSync(apiPath, apiCode, 'utf8');
}


const contextPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/hooks/useChatwootContext.ts';
let ctxCode = fs.readFileSync(contextPath, 'utf8');

const oldHandleMessage = `      // Chatwoot envía datos de contexto dentro de conversation o currentAgent`;

const newHandleMessage = `      // Si no estamos autenticados y recibimos postMessage de Chatwoot, hacemos auto-login silencioso
      const accountIdRaw = payload?.data?.conversation?.account_id || payload?.data?.currentAgent?.account_id || payload?.data?.account?.id || payload?.conversation?.account_id || payload?.account?.id;
      
      if (accountIdRaw && !localStorage.getItem('zabotek_auth_token')) {
         ApiService.iframeAutoLogin(accountIdRaw).then(data => {
            localStorage.setItem('zabotek_auth_token', data.token);
            setIsAuthenticated(true);
            fetchConfigForAccount(accountIdRaw);
         }).catch(console.error);
         return; // Evita doble fetch
      }

      // Chatwoot envía datos de contexto dentro de conversation o currentAgent`;

if (!ctxCode.includes('iframeAutoLogin')) {
  ctxCode = ctxCode.replace(oldHandleMessage, newHandleMessage);
  fs.writeFileSync(contextPath, ctxCode, 'utf8');
}

console.log("Frontend bypass injected");
