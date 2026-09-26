const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src/App.tsx');
let code = fs.readFileSync(appPath, 'utf-8');

code = code.replace(/sessionTimeoutHours/g, 'sessionTimeoutMinutes');
code = code.replace(/Horas antes de cerrar/g, 'Minutos antes de cerrar');
// Change max from 72 to something like 2880 (48 hours in minutes) if it had max="72"
code = code.replace(/max="72"/g, 'max="4320"');

fs.writeFileSync(appPath, code);
console.log("Updated frontend App.tsx to use sessionTimeoutMinutes");
