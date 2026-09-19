const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/hooks/useChatwootContext.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("isAuthenticated")) {
  code = code.replace("const [error, setError] = useState<string | null>(null);", "const [error, setError] = useState<string | null>(null);\n  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('zabotek_auth_token'));");

  const oldCatch = `    } catch (err) {
      console.error(err);
      setError('Error al conectar con la base de datos o inicializar el perfil.');
    } finally {`;
  
  const newCatch = `    } catch (err: any) {
      console.error(err);
      if (err.message === 'No autorizado') {
        setIsAuthenticated(false);
      } else {
        setError('Error al conectar con la base de datos o inicializar el perfil.');
      }
    } finally {`;
  
  code = code.replace(oldCatch, newCatch);
  
  code = code.replace("return { context, config, isLoading, isSaving, notification, error, saveConfig };", "return { context, config, isLoading, isSaving, notification, error, isAuthenticated, setIsAuthenticated, saveConfig, fetchConfigForAccount };");
}

fs.writeFileSync(path, code, 'utf8');
console.log("useChatwootContext.ts patched");
