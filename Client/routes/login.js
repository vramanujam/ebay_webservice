var connectionpool = require('./connectionpool');

var log = require('./logger');

var soap = require('soap');
var baseURL = "http://localhost:8080/ebay_webservice/services";
var option = {
		ignoredNamespaces : true
	};

exports.signin = function(req, res){
	console.log(req.body);
	log.info('sign in attempt initiated ', req.body.inputEmail ,  ' performed at ', new Date().toJSON());
		 var url = baseURL+"/ebay_services?wsdl";
		 soap.createClient(url,option, function(err, client) {
			 var post = {email:req.body.inputEmail}; 
			 client.signin(post, function(err, result) {
			 if(err)
		      {
		          console.log("soap error at signup " + err);
		          return;
		      }
			 console.log(result.signinReturn);
			  var retData = JSON.parse(result.signinReturn);
			  var bcrypt = require('bcryptjs');
			  bcrypt.compare(req.body.inputPassword, retData.password, function(err, condition) {		    	 
			  if(condition == false)
			  {
			 	 log.info('sign in attempt failed ' ,req.body.inputEmail, ' performed at ', new Date().toJSON());
		 		 res.render('index',{err:'incorrect username or password'});
		  	  }		    		 
			  else
			  {
				 console.log('password are similar');
				 req.session.email = req.body.inputEmail;
				 req.session.firstname = retData.firstname;			    	 
				 req.session.name  = retData.firstname + " " + retData.lastname;
				 req.session.id  = retData.userid;
				 req.session.logintime  = retData.logintime;
				 log.info('sign in attempt succeeded ', req.session.id, ' performed at ', new Date().toJSON());
				 console.log("Session initialized "+req.session.id);
				 res.render('dashboard',{}); 	    	 
			  }
			
			 });							     			     
			  });
			});	    

};
exports.signup = function(req, res){
	console.log(req.body);
	var url = baseURL+"/ebay_services?wsdl";
	log.info('sign up attempt initiated',' performed at ', new Date().toJSON());
	var bcrypt = require('bcryptjs');
	  const saltRounds = 10;
	  bcrypt.genSalt(saltRounds, function(err, salt) {
		    bcrypt.hash(req.body.password, salt, function(err, hash) {
		    	 var post  = {firstname: req.body.firstname, lastname:req.body.lastname,email:req.body.email,password:hash};
			   	 soap.createClient(url,option, function(err, client) {
			   	      client.signup(post, function(err, result) {
			   	    	  console.log(result);
			   	    	  if(err)
			   	    	  {
			   	    		  console.log("soap error at signup " + err);
			   	    		  return;
			   	    	  }
			   	    	  if(result.signupReturn === true){
							log.info('sign up attempt ', req.body.email ,' performed at ', new Date().toJSON());
							res.render('index',{err:'Account created successfully'})
							res.send({statusCode:200});
			   	    	  }
			   	    	  else{
							console.log(err);
							log.info('sign up attempt ', req.body.email ,' performed at ', new Date().toJSON());
							res.render('index',{err:'Not able to create an account for you.. user account may already exist'});
							return;
			   	    	  }
			   	      });
			   	  });
		    });
		});		
};

//Logout the user - invalidate the session
exports.logout = function(req,res)
{	
	log.info('logout ', req.body.id ,' performed at ', new Date().toJSON());
	req.session.destroy();
	res.render('index',{ err: '' });
};

exports.getUserName = function(req,res)
{
	var obj = new Object();	
	obj.firstname = req.session.firstname;
	obj.logintime = req.session.logintime;
	res.send(obj);
	
};