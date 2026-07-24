import fs from 'fs';
import path from 'path';
const dir = path.join(process.cwd(), 'src');
const files = [];
function walk(d) {
  for (const name of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, name.name);
    if (name.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(name.name)) files.push(p);
  }
}
walk(dir);
const regex = /["'`]\/images\/([^"'`]+)["'`]/g;
const set = new Set();
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = regex.exec(text))) {
    set.add(m[1]);
  }
}
console.log([...set].sort().join('\n'));
