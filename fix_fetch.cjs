const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const correctFetch = `  useEffect(() => {
    if (context?.accountId) {
      fetch(\`/api/config/\${context.accountId}/metrics\`)
        .then(res => res.json())
        .then(data => setMetrics(data))
        .catch(err => console.error('Error cargando métricas:', err));
    }
  }, [context]);`;

code = code.replace(
  "  useEffect(() => {\n    if (config) {",
  correctFetch + "\n\n  useEffect(() => {\n    if (config) {"
);

fs.writeFileSync(path, code, 'utf8');
console.log("Fixed fetch");
