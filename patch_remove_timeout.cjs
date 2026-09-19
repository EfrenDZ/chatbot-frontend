const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/hooks/useChatwootContext.ts';
let code = fs.readFileSync(path, 'utf8');

const oldCode = `    } else {
      // Si pasan 3 segundos y Chatwoot no ha respondido con postMessage ni hay query params
      const timeout = setTimeout(() => {
        setIsLoading((currentLoading) => {
          if (currentLoading) {
            setError('Esperando identificación de Chatwoot... (Si estás probando fuera de Chatwoot, agrega ?account_id=1 a la URL)');
          }
          return false;
        });
      }, 3500);

      return () => {
        window.removeEventListener('message', handleMessage);
        clearTimeout(timeout);
      };
    }`;

const newCode = `    } else {
      // Finalizamos el estado de carga inicial
      setTimeout(() => setIsLoading(false), 500);
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }`;

code = code.replace(oldCode, newCode);

fs.writeFileSync(path, code, 'utf8');
console.log("Timeout removed");
