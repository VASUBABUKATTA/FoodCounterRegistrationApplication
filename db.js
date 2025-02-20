const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWOR,
    database : process.env.DB_NAME
})

connection.connect((error)=>{
    if(error){console.log("Database Connection failed : "+error); }
    else{ console.log("Database Connection Success : "); }
})

module.exports = connection;