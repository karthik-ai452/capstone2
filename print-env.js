require('dotenv').config();
console.log('DATABASE_URL:', (process.env.DATABASE_URL || '<<NOT SET>>').slice(0, 200));
