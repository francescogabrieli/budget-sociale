/**
 * Db access module
 */

import sqlite3 from 'sqlite3';


const database_path = '../server/db/'; 
const db = new sqlite3.Database(database_path+'db.sqlite', (err) => {
    if (err) throw err;
});

export default db;