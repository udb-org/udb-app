const { execSync } = require('child_process');
const stdout = execSync('ps -e -o pid,args | grep -F "udb-java" | grep -v grep', { encoding: 'utf-8' });
console.log(stdout);
