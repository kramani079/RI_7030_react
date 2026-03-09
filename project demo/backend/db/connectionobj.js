const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'RI_7030',
    password: 'Krish@12',
    port: 5432,
});
module.exports = pool;