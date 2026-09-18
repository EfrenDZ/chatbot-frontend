const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldFetch = `      fetch(\`/api/config/\${context.accountId}/metrics\`)
        .then(res => res.json())
        .then(data => setMetrics(data))
        .catch(err => console.error('Error cargando métricas:', err));`;

const newFetch = `      ApiService.getMetrics(context.accountId)
        .then(data => setMetrics(data))
        .catch(err => console.error('Error cargando métricas:', err));`;

code = code.replace(oldFetch, newFetch);

fs.writeFileSync(path, code, 'utf8');
console.log("Replaced fetch with ApiService successfully");
