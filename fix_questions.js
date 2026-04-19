const fs = require('fs');
const content = fs.readFileSync('src/questions.ts', 'utf8');

// Simple regex to add explanation if missing
// Finds objects that have 'type' but no 'explanation'
const fixed = content.replace(/(type: '.*')(?!,)/g, "$1, explanation: 'شرح السؤال: يعتمد الحل على فهم منطق السؤال وتطبيق القواعد الصحيحة.'");

fs.writeFileSync('src/questions.ts', fixed);
console.log('Fixed questions.ts');
