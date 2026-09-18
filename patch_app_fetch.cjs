const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

// Also import ApiService in App.tsx! Wait, is ApiService imported?
// Let's check imports.
if (!code.includes("import { ApiService }")) {
  code = code.replace(
    "import './index.css';",
    "import './index.css';\nimport { ApiService } from './services/api';"
  );
}

const newFetch = `  useEffect(() => {
    if (context?.accountId) {
      ApiService.getMetrics(context.accountId)
        .then(data => setMetrics(data))
        .catch(err => console.error('Error cargando métricas:', err));
    }
  }, [context]);`;

code = code.replace(
  /  useEffect\(\(\) => \{\n    if \(context\?\.accountId\) \{\n      fetch\([^)]+\)[\s\S]*?\.catch\([^)]+\);\n    \}\n  \}, \[context\]\);/,
  newFetch
);

fs.writeFileSync(path, code, 'utf8');
console.log("App.tsx fetch patched");
