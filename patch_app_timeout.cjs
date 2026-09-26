const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src/App.tsx');
let code = fs.readFileSync(appPath, 'utf-8');

const newField = `
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tiempo de Inactividad (Horas antes de cerrar)
                </label>
                <input 
                  type="number" 
                  name="sessionTimeoutHours" 
                  value={formData.sessionTimeoutHours || 24} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-chatwoot focus:border-chatwoot"
                  min="1"
                  max="72"
                />
              </div>
`;

if (!code.includes('sessionTimeoutHours')) {
  // Insert it after farewellMessage
  const searchStr = `name="farewellMessage" \n                  value={formData.farewellMessage || ''} \n                  onChange={handleChange}\n                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-chatwoot focus:border-chatwoot"\n                />\n              </div>`;
  
  // Actually let's just do a string replacement around farewellMessage
  code = code.replace(
    /name="farewellMessage"[\s\S]*?<\/div>/,
    match => match + '\n' + newField
  );
  fs.writeFileSync(appPath, code);
  console.log("Patched frontend to include sessionTimeoutHours!");
} else {
  console.log("Already has sessionTimeoutHours");
}
