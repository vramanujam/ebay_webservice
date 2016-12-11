/**
 * New node file
 */
var mysql     =    require('mysql');

var dbpool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : 'localhost',
    user     : 'root',
    password : 'oilfoods',
    database : 'ebay',
    debug    :  false
});

module.exports = dbpool;


	
