// setup.js

const fs = require('fs');
const path = require('path');

// Check if we're in the right directory
console.log('Current directory:', process.cwd());
console.log('Files in current directory:');
fs.readdirSync(process.cwd()).forEach(file => {
  console.log(' - ' + file);
});

// Check if package.json exists
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('\npackage.json exists! Contents:');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log(packageJson);
} else {
  console.log('\npackage.json does not exist!');
}

// Check the directory structure
function listDir(dir, level = 0) {
  const indent = ' '.repeat(level * 2);
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory() && item !== 'node_modules') {
      console.log(`${indent}- ${item}/ (dir)`);
      listDir(itemPath, level + 1);
    } else if (stats.isFile()) {
      console.log(`${indent}- ${item} (file)`);
    } else if (item === 'node_modules') {
      console.log(`${indent}- ${item}/ (node_modules dir)`);
    }
  });
}

console.log('\nDirectory structure:');
listDir(process.cwd());
