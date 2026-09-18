const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/services/api.ts';
let code = fs.readFileSync(path, 'utf8');

const getMetricsFn = `
  getMetrics: async (accountId: number) => {
    const response = await fetch(\`\${API_BASE_URL}/api/config/\${accountId}/metrics\`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener las métricas');
    }

    return response.json();
  },
`;

code = code.replace(
  "export const ApiService = {",
  "export const ApiService = {\n" + getMetricsFn
);

fs.writeFileSync(path, code, 'utf8');
console.log("ApiService patched");
