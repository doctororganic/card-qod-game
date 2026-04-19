const fs = require('fs');
const content = fs.readFileSync('src/questions.ts', 'utf8');

// The regex needs to be more robust to handle commas
// Each question object looks like:
// {
//   id: '...',
//   ...
//   type: '...',
// }
// or
//   type: '...'
// }

const fixed = content.replace(/(type:\s*'[^']*')(?!,)/g, "$1, explanation: 'شرح السؤال: يعتمد الحل على فهم منطق السؤال وتطبيق القواعد الصحيحة.'");

fs.writeFileSync('src/questions.ts', fixed);
console.log('Fixed questions.ts');
