const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import { Login }")) {
  code = code.replace("import { ApiService } from './services/api';", "import { ApiService } from './services/api';\nimport { Login } from './components/Login';");
  
  code = code.replace("const { context, config, isLoading, isSaving, notification, error, saveConfig } = useChatwootContext();", "const { context, config, isLoading, isSaving, notification, error, isAuthenticated, setIsAuthenticated, saveConfig, fetchConfigForAccount } = useChatwootContext();");

  const loginCheck = `  if (!isAuthenticated) {
    return <Login onSuccess={() => {
      setIsAuthenticated(true);
      if (context.accountId) fetchConfigForAccount(context.accountId, context.conversationId);
      else fetchConfigForAccount(1); // Default o esperar
    }} />;
  }

  if (isLoading) {`;

  code = code.replace("  if (isLoading) {", loginCheck);
}

fs.writeFileSync(path, code, 'utf8');
console.log("App.tsx patched for Auth");
