const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

const badDelete = `                      <button type="button" onClick={() => {
                        const h = { ...(formData.apiHeaders as any) };
                        delete h[k];
                        setFormData((prev: any) => ({...prev, apiHeaders: h}));
                      }} className="text-red-400 hover:text-red-600 font-bold px-2">✕</button>`;

const goodDelete = `                      <button type="button" onClick={() => {
                        let currentH = formData.apiHeaders;
                        if (typeof currentH === 'string') { try { currentH = JSON.parse(currentH); } catch(e) { currentH = {}; } }
                        const h = { ...(typeof currentH === 'object' && currentH ? currentH : {}) };
                        delete h[k];
                        setFormData((prev: any) => ({...prev, apiHeaders: h}));
                      }} className="text-red-400 hover:text-red-600 font-bold px-2">✕</button>`;

code = code.replace(badDelete, goodDelete);
fs.writeFileSync(appPath, code, 'utf8');
