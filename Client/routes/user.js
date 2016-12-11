
var connectionpool = require('./connectionpool');
var log = require('./logger');
var bidlog = require('./bidlogger');
var soap = require('soap');
var baseURL = "http://localhost:8080/ebay_webservice/services";
var option = {
	ignoredNamespaces : true
};
var url = baseURL+"/ebay_services?wsdl";

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.updateuser = function(req, res){
	log.info('updateuser ', req.session.id, ' performed at ', new Date().toJSON());
	
	connectionpool.getConnection(function(err,connection){
		  if(err){
		    console.log('Error connecting to Db');
		    connectionpool.releaseSQLConnection(connection);
		    return;
		  }
		  var bcrypt = require('bcryptjs');
		  bcrypt.genSalt(10, function(err, salt) {
		      bcrypt.hash(req.body.password, salt, function(err, hash) {
		          // Store hash in your password DB. 
		    	  connection.query(
	       			  'UPDATE ebayuserdetails SET password = ?,address = ?,birthdate = ?,phonenumber = ?,ebayhandle = ? Where email = ?',
	       			  [hash,req.body.address,req.body.birthdate,req.body.phonenumber,req.body.ebayhandle, req.session.email],
	       			  function (err, result) {
	       			    if (err)
	       			    {
	       			    	connectionpool.releaseSQLConnection(connection);
	       			    	throw err;
	       			    }
	       			    	console.log('Changed ' + result.changedRows + ' rows');
	       			    	connectionpool.releaseSQLConnection(connection);
	       			    	res.render("userprofile",{}); 
	       			  }
	       			);
		      });
		  });
		  
	});
	
	
};
exports.postad = function(req, res){
	console.log(req.body);
	log.info('postad ', req.session.id, ' performed at ', new Date().toJSON(), ' item is ',req.body.itemname);
	var post = {};
	post.itemname = req.body.itemname;
	post.itemdescription = req.body.itemdescription;
	post.sellerinformation = req.session.firstname + " " + req.session.firstname ;
	post.itemprice = parseFloat(req.body.itemprice);
	post.quantity = parseInt(req.body.quantity);
	post.bidding = req.body.bidding;
	post.userid = req.session.id;
	post.email = req.session.email;
	console.log(JSON.stringify(post));
	soap.createClient(url,option, function(err, client) {
		client.postad(post, function(err, result) {
			console.log(result);
			if(err)
			{
				console.log("soap error at signup " + err);
				return;
			}
			if(result.postadReturn === true){
				if(post.bidding == 'true')
					console.log("post ad succeed ");
					bidlog.info('bid posted by ', req.session.id, ' performed at ', new Date().toJSON(), ' bid item ',req.body.itemname,' ',req.body.itemid);
			}
			else{
				console.log("post ad failed " + err);
			}
		});
	});
	res.render("dashboard",{}); 
};
exports.getad = function(req, res){
	log.info('getad ', req.session.id, ' performed at ', new Date().toJSON());
	soap.createClient(url,option, function(err, client) {
		client.getad({id:req.session.id}, function(err, result) {
			if(err)
			{
				console.log("soap error at signup " + err);
				return;
			}
			var ret = JSON.parse(result.getadReturn);
			console.log(ret.value);
			res.send(ret.value);
		});
	});
};
exports.getcartvolume = function(req, res){
	log.info('getcartvolume ', req.session.id, ' performed at ', new Date().toJSON());
	soap.createClient(url,option, function(err, client) {
		client.getcartvolume({id:req.session.id}, function(err, result) {
			if(err)
			{
				console.log("soap error at signup " + err);
				return;
			}
			var ret = JSON.parse(result.getcartvolumeReturn);
			console.log(ret.value);
			res.send(ret.value);
		});
	});

};
exports.getUserInfo = function(req, res){
	log.info('get user info ', req.session.id, ' performed at ', new Date().toJSON());
	soap.createClient(url,option, function(err, client) {
		client.getUserInfo({id:req.session.id}, function(err, result) {
			if(err)
			{
				console.log("soap error at signup " + err);
				return;
			}
			var ret = JSON.parse(result.getUserInfoReturn);
			console.log(ret.value);
			res.send(ret.value);
		});
	});
};
exports.addBid = function(req, res){
	log.info('addbid ', req.session.id, ' performed at ', new Date().toJSON());
	var netPrice = parseFloat(req.body.itemprice) + parseFloat(req.body.bid);
	var quantity = parseInt(req.body.quantitySelected)+1;
	var arg = {};
	arg.itemno = req.body.itemid;
	arg.userid = req.session.id;
	arg.bidplaced = netPrice;
	arg.quantity = quantity;
	soap.createClient(url,option, function(err, client) {
		client.addBid(arg, function(err, result) {
			if(err)
			{
				console.log("soap error at signup " + err);
				return;
			}
			if(result.addBidReturn)
			{
				bidlog.info('bid placed by ', req.session.id, ' performed at ', new Date().toJSON(), ' for item ',req.body.itemid, ' amount ',netPrice);
				console.log('bid placed');
			}
		});
	});
		res.render("dashboard",{}); 
	};
exports.searchad = function(req, res){
	console.log(req.body.searchphrase);
	log.info('searchad ', req.session.id, ' performed at ', new Date().toJSON(),' keyword ',req.body.searchphrase);
	var arg = {};
	arg.searchphrase = req.body.searchphrase;
	arg.userid = req.session.id;

	soap.createClient(url,option, function(err, client) {
		client.searchad(arg, function(err, result) {
			if(err)
			{
				console.log("soap error at signup " + err);
				return;
			}
			var ret = JSON.parse(result.searchadReturn);
			console.log(ret.value);
			res.send(ret.value);
		});
	});
};
	
exports.updateSingleUserVal = function(req,res){
		  log.info('updateSingleUserVal done by ', req.session.id, ' performed at ', new Date().toJSON(),' cart item no ',req.body.cartNo);
		  console.log(req.body);
		  connectionpool.getConnection(function(err,connection){
		  if(err){
			connectionpool.releaseSQLConnection(connection);  
		    console.log('Error connecting to Db');
		    return;
		  }
		  connection.query(
 			  'UPDATE ebayuserdetails SET '+ req.body.data + ' = ? Where userid = ?',
 			  [req.body.value,req.session.id],
 			  function (err, result) {
 			    if (err)
 			    {
 			    	console.log(err);
 			    	connectionpool.releaseSQLConnection(connection);
 			    	throw err;
 			    }
 			    //--
	   			 connectionpool.releaseSQLConnection(connection);
 			    //--
 		 });		  
	});
	
	// res.send("success");
};

exports.changeCartQuantity = function(req,res){
		  log.info('Cart Quantity Changed by ', req.session.id, ' performed at ', new Date().toJSON(),' cart item no ',req.body.cartNo);
		  connectionpool.getConnection(function(err,connection){
		  if(err){
			connectionpool.releaseSQLConnection(connection);  
		    console.log('Error connecting to Db');
		    return;
		  }
		  connection.query(
   			  'UPDATE cart SET quantityselected = ? Where cartno = ?',
   			  [req.body.changedQuantity,req.body.cartNo],
   			  function (err, result) {
   			    if (err)
   			    {
   			    	connectionpool.releaseSQLConnection(connection);
   			    	throw err;
   			    }
   			    //--
	   			 connection.query('select * from advertisements INNER JOIN cart ON advertisements.itemno = cart.itemno INNER JOIN ebayuserdetails ON cart.userid = ebayuserdetails.userid where advertisements.quantity >= cart.quantityselected and cart.userid = ?',[req.session.id], function(err, rows, fields) {
	   			  if (!err)
	   			  {
	   			     console.log('The solution is: '+ rows.length + ' ' + JSON.stringify(rows[0]));
	   			     connectionpool.releaseSQLConnection(connection);
	   			     var objToSend = new Object();
	   			     //objToSend.cartItems = rows;
	   			     var i = 0, total = 0;
	   			     for(i = 0; i < rows.length; i++)
	   			     {
	   			    	 total = total + (rows[i].itemprice * rows[i].quantityselected);
	   			     }
	   			     objToSend.carttotal = total;
	   			     
	   			     res.send(objToSend);		    	 		    
	   			  }
	   			  else
	   			  {
	   				connectionpool.releaseSQLConnection(connection);  
	   			  
	   			    console.log('Error while performing Query.');
	   			  }
	   		  });
   			    //--
   		 });
		  
	});
};
exports.getUserHistory = function(req, res){
	log.info('User history view ', req.session.id, ' performed at ', new Date().toJSON());
	connectionpool.getConnection(function(err,connection){
	  if(err)
	  {
		connectionpool.releaseSQLConnection(connection);  
	    console.log('Error connecting to Db');
	    return;
	  }
	  connection.query('SELECT * from userhistory where userid = ?',[req.session.id], function(err, rows, fields) {
		  if (!err)
		  {
		     console.log('The solution is: '+ rows.length + ' ' + JSON.stringify(rows[0]));
		     connectionpool.releaseSQLConnection(connection);
		     res.send(rows);		    	 		    
		  }
		  else
		  {
			  connectionpool.releaseSQLConnection(connection);
			  console.log('Error while performing Query.');				  
		  }
	   }); 
	});
};
exports.addToCart = function(req, res){
	log.info('item added to cart ', req.session.id, ' performed at ', new Date().toJSON(),' item no ',req.body.itemid);
	console.log(req.body);
	connectionpool.getConnection(function(err,connection){
		  if(err){
			connectionpool.releaseSQLConnection(connection);  
		    console.log('Error connecting to Db');
		    return;
		  }
		  var post = new Object();
		  post.itemno = req.body.itemid;
		  post.quantityselected = parseInt(req.body.quantitySelected)+1;
		  post.userid = req.session.id;
		  //post.dateposted = NOW();
		  //var post  = {itemname: req.body.itemname, itemdescription:req.body.itemdescription,sellerinformation:req.body.itemdescription,itemprice:req.body.itemprice,quantity:req.body.quantity,bidding:req.body.bidding,userid:req.session.id};
		  console.log(JSON.stringify(post));
		  var query =  connection.query('INSERT INTO cart SET ?', post,function (err, result) {
   			    if (err) 
   			    {
   			    	connectionpool.releaseSQLConnection(connection);
   			    	throw err;
   			    }
   			    connectionpool.releaseSQLConnection(connection);
   		  });
		  
	});
	
	res.render("cart",{});
	//res.render("dashboard",{});
};
exports.getCart = function(req, res){		
	log.info('Cart viewed ', req.session.id, ' performed at ', new Date().toJSON());
	connectionpool.getConnection(function(err,connection){
		  if(err){
			connectionpool.releaseSQLConnection(connection);  
		    console.log('Error connecting to Db');
		    return;
		  }
		  console.log('Connection established new' + err);
		  connection.query('select * from advertisements INNER JOIN cart ON advertisements.itemno = cart.itemno INNER JOIN ebayuserdetails ON cart.userid = ebayuserdetails.userid where advertisements.quantity >= cart.quantityselected and cart.userid = ?',[req.session.id], function(err, rows, fields) {
		  if (!err)
		  {
		     console.log('The solution is: '+ rows.length + ' ' + JSON.stringify(rows[0]));
		     
		     var objToSend = new Object();
		     objToSend.cartItems = rows;
		     var i = 0, total = 0;
		     for(i = 0; i < rows.length; i++)
		     {
		    	 total = total + (rows[i].itemprice * rows[i].quantityselected);
		     }
		     objToSend.carttotal = total;
		     //res.send(objToSend);	
		     connection.query('select * from advertisements INNER JOIN bid ON advertisements.itemno = bid.itemno INNER JOIN ebayuserdetails ON bid.userid = ebayuserdetails.userid where  bid.userid = ?',[req.session.id], function(err, rows, fields) {
		    	 if(!err)
		    	 {
		    		 objToSend.bidItems = rows;
		    		 res.send(objToSend);
		    	 }
		    	 connectionpool.releaseSQLConnection(connection);
		     });	     
		  }
		  else
		  {
			  console.log('Error while performing Query.');
			  connectionpool.releaseSQLConnection(connection);
		  }
		    
		});		 
	});
};
exports.removeFromCart = function(req,res){
	log.info('item removed from cart ', req.session.id, ' performed at ', new Date().toJSON(),' item no ',req.body.itemno);
	connectionpool.getConnection(function(err,connection){
	  if(err)
	  {
		connectionpool.releaseSQLConnection(connection);
	    console.log('Error connecting to Db');
	    return;
	  }
	  console.log('Connection established new' + err);
	  connection.query('delete from cart where itemno = ?',req.body.itemno, function(err, result) {
		  if (err){
			  connectionpool.releaseSQLConnection(connection);
			  throw err;
		  }
		  //--
		  connection.query('select * from advertisements INNER JOIN cart ON advertisements.itemno = cart.itemno INNER JOIN ebayuserdetails ON cart.userid = ebayuserdetails.userid where advertisements.quantity >= cart.quantityselected and cart.userid = ?',req.session.id, function(err, rows, fields) {
			  if (!err)
			  {
			     console.log('The solution is: '+ rows.length + ' ' + JSON.stringify(rows[0]));
			     connectionpool.releaseSQLConnection(connection);
			     var objToSend = new Object();
			     objToSend.cartItems = rows;
			     var i = 0, total = 0;
			     for(i = 0; i < rows.length; i++)
			     {
			    	 total = total + (rows[i].itemprice * rows[i].quantityselected);
			     }
			     objToSend.carttotal = total;
			     res.send(objToSend);		    	 		    
			  }
			  else{
			    console.log('Error while performing Query.');
			    connectionpool.releaseSQLConnection(connection);
			  }
		  });
		  //--
		});	 
	});
};