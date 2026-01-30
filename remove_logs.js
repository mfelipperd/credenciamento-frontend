const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:/Users/felip/Projetos/credenciamento-frontend/src');
console.log(`Found ${files.length} files`);

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const newContent = content.replace(/console\.log\s*\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\);?/g, '');
    
    if (content !== newContent) {
      console.log(`Cleaning ${file}`);
      fs.writeFileSync(file, newContent, 'utf8');
    }
  } catch (err) {
    console.error(`Error processing ${file}: ${err.message}`);
  }
});
