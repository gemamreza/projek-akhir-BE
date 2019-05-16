const mysql = require('mysql')
 
const db = mysql.createConnection({
    host : 'localhost',
    user: 'root' ,
    password : 'gemaster12345' ,
    database : 'lokalmarket_ta' ,
    port : 3306 ,
})

module.exports = db

