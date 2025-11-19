const crypto = require('crypto');

console.log('🔑 Chaves geradas:\n');
console.log('JWT_SECRET=' + crypto.randomBytes(64).toString('hex'));
console.log('SESSION_SECRET=' + crypto.randomBytes(64).toString('hex'));