const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const loginCheck = `  if (!isAuthenticated) {
    return <Login onSuccess={() => {
      setIsAuthenticated(true);
      if (context.accountId) fetchConfigForAccount(context.accountId, context.conversationId);
      else fetchConfigForAccount(1); // Default
    }} />;
  }

  if (isLoading || !formData) {`;

code = code.replace("  if (isLoading || !formData) {", loginCheck);

fs.writeFileSync(path, code, 'utf8');
console.log("App.tsx patched correctly");
