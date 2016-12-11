var arrayOfConnection= [];

function createConnection()
{
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
		  host     : 'localhost',
		  user     : 'root',
		  password : 'oilfoods',
		  database : 'ebay'
	});
	return connection;
};
for(var i=0;i<100;i++){
	var connection=createConnection();
	arrayOfConnection.push(connection);
}
exports.getConnection = function(callback)
{
	var connection = arrayOfConnection.pop();
    //pop fails will create new connection
	if(connection == undefined)
		connection = createConnection();
	callback((connection == undefined)?true:false,connection);
	//return connection;
}
exports.getSQLConnection = function(){
	var connection = arrayOfConnection.pop();
    //pop fails will create new connection
	if(connection == undefined)
		connection = createConnection();
	return connection;
};
exports.releaseSQLConnection = function(connection){
	console.log("Connection Released");
	arrayOfConnection.push(connection);
	//connection.end();
};
var recursive = function () {
   // console.log("It has been one second!");
}
//setInterval(recursive, 20);