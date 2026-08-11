const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir('F:/Attendence/attendance-app/dist', 'F:/Attendence/attendance-apk/dist');

// Update dist/index.html to use relative paths for Capacitor loading
const htmlPath = 'F:/Attendence/attendance-apk/dist/index.html';
if (fs.existsSync(htmlPath)) {
  let content = fs.readFileSync(htmlPath, 'utf8');
  content = content.replace(/href="\//g, 'href="./');
  content = content.replace(/src="\//g, 'src="./');
  fs.writeFileSync(htmlPath, content, 'utf8');
  console.log('Updated dist/index.html with relative asset URLs.');
}

console.log('Successfully copied dist assets to attendance-apk/dist');
