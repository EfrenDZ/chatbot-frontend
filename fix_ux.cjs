const fs = require('fs');
const pathContext = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/hooks/useChatwootContext.ts';
let codeContext = fs.readFileSync(pathContext, 'utf8');

// 1. Añadir isSaving y notification al contexto
codeContext = codeContext.replace(
  "const [isLoading, setIsLoading] = useState(true);",
  "const [isLoading, setIsLoading] = useState(true);\n  const [isSaving, setIsSaving] = useState(false);\n  const [notification, setNotification] = useState<{message: string, type: 'success'|'error'} | null>(null);"
);

// 2. Modificar saveConfig para usar isSaving en vez de isLoading y setNotification en vez de alert
const newSaveConfig = `  const saveConfig = async (newConfig: any) => {
    if (!context.accountId) return;
    try {
      setIsSaving(true);
      const updatedData = await ApiService.updateBotConfig(context.accountId, newConfig);
      setConfig(updatedData);
      setNotification({ message: '¡Configuración guardada exitosamente!', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Error al guardar la configuración.', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return { context, config, isLoading, isSaving, notification, error, saveConfig };`;

codeContext = codeContext.replace(
  /  const saveConfig = async \([^)]+\) => \{[\s\S]*?return \{ context, config, isLoading, error, saveConfig \};\n\}/,
  newSaveConfig + "\n}"
);
fs.writeFileSync(pathContext, codeContext, 'utf8');

// 3. Modificar App.tsx para desestructurar isSaving y notification, y mostrar el Toast y el spinner en el botón
const pathApp = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let codeApp = fs.readFileSync(pathApp, 'utf8');

codeApp = codeApp.replace(
  "const { context, config, isLoading, error, saveConfig } = useChatwootContext();",
  "const { context, config, isLoading, isSaving, notification, error, saveConfig } = useChatwootContext();"
);

// Cambiar el botón de guardado para que muestre spinner si isSaving es true
const newButton = `            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={\`px-6 py-2 bg-chatwoot text-white font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-chatwoot transition-colors flex items-center gap-2 \${isSaving ? 'opacity-75 cursor-not-allowed' : ''}\`}
            >
              {isSaving ? (
                <><svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Guardando...</>
              ) : (
                'Guardar y Aplicar Cambios'
              )}
            </button>`;

codeApp = codeApp.replace(
  /<button\n\s*type="button"\n\s*onClick=\{handleSave\}\n\s*className="px-6 py-2 bg-chatwoot text-white font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-chatwoot transition-colors"\n\s*>\n\s*Guardar y Aplicar Cambios\n\s*<\/button>/,
  newButton
);

// Añadir el toast al final del contenedor principal
const toastHtml = `
      {/* Toast Notification */}
      {notification && (
        <div className={\`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white flex items-center gap-2 transition-all transform duration-300 \${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}\`}>
          {notification.type === 'success' ? (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          ) : (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          {notification.message}
        </div>
      )}
    </div>
  );
}`;

codeApp = codeApp.replace(
  "    </div>\n  );\n}",
  toastHtml
);

fs.writeFileSync(pathApp, codeApp, 'utf8');
console.log("UX issues patched");
