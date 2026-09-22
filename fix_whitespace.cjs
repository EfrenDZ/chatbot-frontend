const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

code = code.replace(
  '<label className="text-xs font-bold text-gray-700 uppercase">3. Llave a Guardar</label>',
  '<label className="text-xs font-bold text-gray-700 uppercase whitespace-nowrap">3. Llave a Guardar</label>'
);

code = code.replace(
  '<label className="text-xs font-bold text-gray-700 uppercase">4. Guardar en Variable</label>',
  '<label className="text-xs font-bold text-gray-700 uppercase whitespace-nowrap">4. Guardar en Variable</label>'
);

fs.writeFileSync(appPath, code, 'utf8');
