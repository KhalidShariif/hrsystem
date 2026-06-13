const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Match alert(error.message || 'some text') or alert(error.message)
      const regex = /alert\(\s*error\.message(?:\s*\|\|\s*'[^']+')?\s*\)/g;
      if (regex.test(content)) {
        content = content.replace(regex, "alert(error?.response?.data?.message || error?.message || 'Action failed')");
        changed = true;
      }
      
      const regex2 = /alert\(\s*error\.message(?:\s*\|\|\s*"[^"]+")?\s*\)/g;
      if (regex2.test(content)) {
        content = content.replace(regex2, 'alert(error?.response?.data?.message || error?.message || "Action failed")');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed alerts in ' + fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
