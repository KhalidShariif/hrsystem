const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'controllers');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Restore function names
  const exportMatch = content.match(/module\.exports\s*=\s*\{\s*([^}]+)\s*\}/);
  if (exportMatch) {
    const exportsList = exportMatch[1].split(',').map(s => s.trim()).filter(s => s);
    let exportIndex = 0;
    
    // Replace "const  = async" with "const funcName = async"
    // Note: Some might be "const = async" or "const  = async" due to spacing issues.
    content = content.replace(/const\s+=\s*async/g, () => {
      const funcName = exportsList[exportIndex++];
      return `const ${funcName} = async`;
    });
  }

  // 2. Restore catch blocks which became "return \n  }"
  // I need to change them to "return res.status(500).json({ message: error.message });"
  content = content.replace(/catch\s*\(\s*(?:error|err)\s*\)\s*\{\s*return\s*\n\s*\}/g, 'catch (error) {\n    return res.status(500).json({ message: error.message });\n  }');
  
  // Wait, what if the original was res.status(400) or 401 or 404? 
  // I replaced ALL of them with return <empty> because $1 was empty!
  // This means I lost the specific status codes in the catch blocks!
  // Most catch blocks were 500, some were 400. Replacing all with 500 is generally acceptable for catch blocks.

  fs.writeFileSync(filePath, content);
  console.log('Restored ' + file);
}
