const fs = require('fs');
const code = fs.readFileSync('src/app/(dashboard)/projects/[id]/page.tsx', 'utf8');
console.log(code.includes('assignmentsRes.error') ? 'Error is checked' : 'Error NOT checked');
