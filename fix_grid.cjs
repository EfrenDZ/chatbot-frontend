const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

const oldGrid = `<div className="grid grid-cols-2 gap-4">
                <div className="border border-green-200 bg-green-50/30 rounded p-3">`;

const newGrid = `<div className="flex gap-4 overflow-x-auto pb-4 items-start">
                <div className="border border-green-200 bg-green-50/30 rounded p-3 min-w-[350px] flex-1 flex-shrink-0">`;

code = code.replace(oldGrid, newGrid);

const oldErrorGrid = `<div className="border border-red-200 bg-red-50/30 rounded p-3">`;
const newErrorGrid = `<div className="border border-red-200 bg-red-50/30 rounded p-3 min-w-[350px] flex-1 flex-shrink-0">`;
code = code.replace(oldErrorGrid, newErrorGrid);

fs.writeFileSync(appPath, code, 'utf8');
