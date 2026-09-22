const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

const badCode = `                  onChange={(e) => {
                     try {
                        const val = e.target.value ? JSON.parse(e.target.value) : undefined;
                        setFormData(prev => ({...prev, apiHeaders: val}));
                     } catch(e) {
                        setFormData(prev => ({...prev, apiHeaders: e.target.value}));
                     }
                  }}`;

const goodCode = `                  onChange={(e) => {
                     const inputValue = e.target.value;
                     try {
                        const val = inputValue ? JSON.parse(inputValue) : undefined;
                        setFormData((prev: any) => ({...prev, apiHeaders: val}));
                     } catch(err) {
                        setFormData((prev: any) => ({...prev, apiHeaders: inputValue}));
                     }
                  }}`;

code = code.replace(badCode, goodCode);
fs.writeFileSync(appPath, code, 'utf8');
