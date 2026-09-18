const fs = require('fs');
const path = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldButton = `            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-chatwoot hover:bg-blue-600 text-white px-8 py-3 rounded-lg shadow-sm font-bold text-base transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Guardando...' : 'Guardar y Aplicar Cambios'}
            </button>`;

const newButton = `            <button 
              type="submit" 
              disabled={isSaving}
              className={\`bg-chatwoot hover:bg-blue-600 text-white px-8 py-3 rounded-lg shadow-sm font-bold text-base transition-colors flex items-center gap-2 cursor-pointer \${isSaving ? 'opacity-75 cursor-not-allowed' : ''}\`}
            >
              {isSaving ? (
                <><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Guardando...</>
              ) : (
                'Guardar y Aplicar Cambios'
              )}
            </button>`;

code = code.replace(oldButton, newButton);
fs.writeFileSync(path, code, 'utf8');
console.log("Button fixed");
