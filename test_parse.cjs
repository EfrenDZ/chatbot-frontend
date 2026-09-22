const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

const badRender = `{Object.entries(typeof formData.apiHeaders === 'object' && formData.apiHeaders ? formData.apiHeaders : {}).map(([k, v]) => (`;

const goodRender = `{Object.entries((() => {
                    let h = formData.apiHeaders;
                    if (typeof h === 'string') { try { h = JSON.parse(h); } catch(e) { h = {}; } }
                    return (typeof h === 'object' && h) ? h : {};
                  })()).map(([k, v]) => (`;

code = code.replace(badRender, goodRender);

const badAdd = `const h = { ...(typeof formData.apiHeaders === 'object' ? formData.apiHeaders : {}), [kInput.value]: vInput.value };`;

const goodAdd = `let currentH = formData.apiHeaders;
                        if (typeof currentH === 'string') { try { currentH = JSON.parse(currentH); } catch(e) { currentH = {}; } }
                        const h = { ...(typeof currentH === 'object' && currentH ? currentH : {}), [kInput.value]: vInput.value };`;

code = code.replace(badAdd, goodAdd);

fs.writeFileSync(appPath, code, 'utf8');
