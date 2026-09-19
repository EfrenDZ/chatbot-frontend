const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const authBlock = `  if (!isAuthenticated) {
    return <Login onSuccess={() => {
      setIsAuthenticated(true);
      if (context.accountId) fetchConfigForAccount(context.accountId, context.conversationId);
      else fetchConfigForAccount(1); // Default
    }} />;
  }`;

const errBlock = `  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-red-50">
        <div className="text-center text-red-600 font-medium p-4 border border-red-200 rounded-md bg-white shadow-xs">
          {error}
        </div>
      </div>
    );
  }`;

// Remover ambos
code = code.replace(authBlock, "");
code = code.replace(errBlock, "");

// Insertarlos en el orden correcto justo antes de isLoading
const insertTarget = `  if (isLoading || !formData) {`;
const insertContent = `${authBlock}\n\n${errBlock}\n\n  if (isLoading || !formData) {`;

code = code.replace(insertTarget, insertContent);

fs.writeFileSync(path, code, 'utf8');
console.log("App order patched");
