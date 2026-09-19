const fs = require('fs');
const pathLogin = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/components/Login.tsx';
let codeLogin = fs.readFileSync(pathLogin, 'utf8');

codeLogin = codeLogin.replace("localStorage.setItem('zabotek_auth_token', data.token);", "localStorage.setItem('zabotek_auth_token', data.token);\n      if (data.user?.accounts?.length > 0) {\n        localStorage.setItem('zabotek_default_account', data.user.accounts[0].id.toString());\n      }");
fs.writeFileSync(pathLogin, codeLogin, 'utf8');

const pathContext = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/hooks/useChatwootContext.ts';
let codeContext = fs.readFileSync(pathContext, 'utf8');

const oldEffect = `  useEffect(() => {
    // 1. Escuchar eventos postMessage de Chatwoot Dashboard App`;

const newEffect = `  useEffect(() => {
    // Si estamos fuera de Chatwoot (standalone) y ya hay cuenta por defecto, usarla al inicio
    const defaultAcc = localStorage.getItem('zabotek_default_account');
    if (defaultAcc && !context.accountId) {
      // Pequeño retraso para dar prioridad al iframe si existe
      setTimeout(() => {
        if (!window.chatwootIframeActive) {
          fetchConfigForAccount(parseInt(defaultAcc, 10));
        }
      }, 500);
    }

    // 1. Escuchar eventos postMessage de Chatwoot Dashboard App`;

codeContext = codeContext.replace(oldEffect, newEffect);

const oldHandle = `const accountId = 
        payload?.data?.conversation?.account_id ||`;

const newHandle = `window.chatwootIframeActive = true;
      const accountId = 
        payload?.data?.conversation?.account_id ||`;

codeContext = codeContext.replace(oldHandle, newHandle);

fs.writeFileSync(pathContext, codeContext, 'utf8');

const pathApp = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let codeApp = fs.readFileSync(pathApp, 'utf8');

const oldApp = `  if (!context?.accountId && !config && !isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-red-50">
        <div className="text-center text-red-600 font-medium p-4 border border-red-200 rounded-md bg-white shadow-xs">
          Esperando identificación de Chatwoot... (Si estás probando fuera de Chatwoot, agrega ?account_id=1 a la URL)
        </div>
      </div>
    );
  }`;

codeApp = codeApp.replace(oldApp, "");

fs.writeFileSync(pathApp, codeApp, 'utf8');
console.log("Standalone logic patched");
