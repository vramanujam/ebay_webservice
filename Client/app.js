var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , login = require('./routes/login')
  , dashboard = require('./routes/dashboard')
  , http = require('http')
  , session = require('client-sessions')
  , navigate = require('./routes/navigate')
  , path = require('path')
  , pay = require('./routes/payment')
  , scheduler = require('./routes/scheduler')
  , url  = require('url');

var soap = require('soap');
var baseURL = "http://localhost:8080/ebay_webservice/services";
var option = {
	ignoredNamespaces : true
};
var soapurl = baseURL+"/ebay_services?wsdl";


var CronJob = require('cron').CronJob;
var connectionpool = require('./routes/connectionpool');
var app = express();

// all environments
app.use(session({   
cookieName: 'session',    
secret: 'cmpe273_test_string',    
duration: 30 * 60 * 1000,    //setting the time for active session
activeDuration: 5 * 60 * 1000  })); // setting time for the session to be active when the window is open // 5 minutes set currently

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

function requireLogin(req, res, next){
	if(req.session.email)
	{
		next();
	}		
	else
	{
		res.render('index',{ err: '' });
	}
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/logout',login.logout);
app.get('/getUserName',requireLogin,login.getUserName);

app.get('/userprofile',requireLogin,navigate.userprofile);
app.get('/postad',requireLogin,navigate.postad);
app.get('/cart',requireLogin,navigate.cart);
app.get('/userhistory',requireLogin,navigate.userhistory);

app.get('/dashboard',dashboard.dashboard);
app.get('/getad',requireLogin,user.getad);
app.get('/getCart',requireLogin,user.getCart);//
app.get('/onPayment',requireLogin, pay.onPayment);
app.get('/getUserHistory',requireLogin,user.getUserHistory);
app.get('/getUserInfo',requireLogin,user.getUserInfo);
app.get('/getcartvolume',requireLogin,user.getcartvolume);


app.post('/onPayment', pay.onPayment);
app.post('/signin',login.signin);
app.post('/signup',login.signup);
app.post('/logout',login.logout);
app.post('/updateuser',user.updateuser);
app.post('/postad',user.postad);
app.post('/addToCart',user.addToCart); //
app.post('/searchad',user.searchad);
app.post('/checkout',pay.checkout);
app.post('/removeFromCart',user.removeFromCart);//
app.post('/changeCartQuantity',user.changeCartQuantity);
app.post('/addBid', user.addBid);
app.post('/updateSingleUserVal', user.updateSingleUserVal);


app.use(function(req, res, next) {
	 	var url_parts = url.parse(req.url);
	 	console.log(url_parts);
	 
	 	console.log(url_parts.pathname);
	 	soap.createClient(soapurl,option, function(err, client) {
			client.getebayhandle({handle:url_parts.pathname.substring(1,url_parts.pathname.length)}, function(err, result) {
				if(err)
				{
					res.status(200).send('Invalid path');
					return;
				}
				var ret = JSON.parse(result.getebayhandleReturn);
				console.log(ret.value);
				var rows = ret.value;
				if(rows.length == 0){
					res.status(200).send('Invalid path');
					//res.render('error',{});

				}
				else
					res.render('ebayhandlepage',{email:rows[0].email,firstname:rows[0].firstname, lastname:rows[0].lastname, logintime:rows[0].logintime, phonenumber:rows[0].phonenumber,address:rows[0].address,birthdate:rows[0].birthdate});

			});
		});
	 	/*connectionpool.getConnection(function(err,connection)
	 	{
 		  if(err)
 		  {
 			//connection.release();  
 			connectionpool.releaseSQLConnection(connection);
 			console.log('Error connecting to Db');
 		    return;
 		  }
 		  connection.query('SELECT * from ebayuserdetails where ebayhandle = ?',[url_parts.pathname.substring(1,url_parts.pathname.length)], function(err, rows, fields) {
 			  if (!err)
 			  {
 			     console.log('The solution is: '+ rows.length + ' ' + JSON.stringify(rows[0]));
 			     if(rows.length == 0){
 			    	res.status(200).send('Invalid path');
 			    	//res.render('error',{});
 			    	
 			     } 
 			     else
 			    	 res.render('ebayhandlepage',{email:rows[0].email,firstname:rows[0].firstname, lastname:rows[0].lastname, logintime:rows[0].logintime, phonenumber:rows[0].phonenumber,address:rows[0].address,birthdate:rows[0].birthdate});
 			     //connection.release();
 			     connectionpool.releaseSQLConnection(connection);
 			     //res.send(rows);		    	 		    
 			  }
 			  else
 			  {
 				 res.status(200).send('Invalid path');
 				  //res.render('error',{}); 
 				  //connection.release();
 				  connectionpool.releaseSQLConnection(connection);
 				  console.log('Error while performing Query.');				  
 			  }
 		   }); 
 		});*/
	 	
	});

http.createServer(app).listen(app.get('port')/*,'10.0.0.75'*/, function(){
  console.log('Express server listening on port ' + app.get('port'));
});
