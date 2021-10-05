const mysql = require('mysql');

// connection to the databse
const dbhost = 'localhost';
const user = 'root';
const dbname = 'stars_world';

const db = mysql.createConnection({
  user: user,
  host: dbhost,
  database: dbname
})

db.connect((err)=>{
  if(err) throw err;
})


module.exports = db;