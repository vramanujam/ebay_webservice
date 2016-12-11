var connectionpool = require('./connectionpool');
var log = require('./logger');
function check_card_num(cardnum) {

	if (/[^0-9-\s]+/.test(cardnum)) return false;

	var ncPointer = 0, ndPointer = 0, isEvenPos = false;
	cardnum = cardnum.replace(/\D/g, "");

	for (var n = cardnum.length - 1; n >= 0; n--) {
		var cDigit = cardnum.charAt(n),
		ndPointer = parseInt(cDigit, 10);

		if (isEvenPos) {
			if ((ndPointer *= 2) > 9) ndPointer -= 9;
		}

		ncPointer += ndPointer;
		isEvenPos = !isEvenPos;
	}

	return (ncPointer % 10) == 0;
}
function valid_year(month,year)
{
	return ((month != 'Month') && (parseInt(year)>16));
}
function valid_name(name)
{
	console.log('name length ' + name.length);
	return ((name.length != 0));
}
function valid_cvv(cvv)
{
	var reg = new RegExp('^[0-9]+$');
	if(/[^0-9\s]+/.test(cvv)) return  false;
	console.log('cvv length is ' + cvv.length);
	return (cvv.length == 3);
}
/**
 * New node file
 */
exports.onPayment = function(req, res){
	log.info('payment transaction ', req.session.id, ' performed at ', new Date().toJSON());
	console.log(req.body.cardholdername);		
	console.log(req.body.cardnumber);
	console.log(req.body.expirymonth);
	console.log(req.body.expiryyear);
	console.log(req.body.test);
	var isValidCreditCardNum = check_card_num(req.body.cardnumber);
	var cardNumPrompt = '';
	if(!isValidCreditCardNum)
		cardNumPrompt = 'Invalid card number';
	var isValidYear = valid_year(req.body.expirymonth,req.body.expiryyear);
	var cardValidYEaPrompt = '';
	if(!isValidYear)
		cardValidYEaPrompt = 'Invalid year';
	var isValidName = valid_name(req.body.cardholdername);
	var cardValidNAme = '';
	if(!isValidName)
		cardValidNAme = 'Invalid name';
	var isValidCVV = valid_cvv(req.body.cvv);
	var cardValidCVV = '';
	if(!isValidCVV)
		cardValidCVV = 'Invalid CVV';

	if(!isValidCVV || !isValidName || !isValidYear || !isValidCreditCardNum )
	{
		log.info('payment failed ', req.session.id, ' performed at ', new Date().toJSON());
		//{ title: '', cardnameerr:'',cardnumerr: '',invaliddate:'',invalidcvv:'' }
		var prompt = new Object();
		prompt.title = "Credit Card Info";
		prompt.cardnameerr = cardValidNAme;
		prompt.cardnumerr = cardNumPrompt;
		prompt.invaliddate = cardValidYEaPrompt;
		prompt.invalidcvv = cardValidCVV;
		res.render('checkout', prompt );
	}	
	else
	{
		log.info('payment successful ', req.session.id, ' performed at ', new Date().toJSON());
		// update quantity in the advertisement table
		// update user history
		connectionpool.getConnection(function(err,connection){
			if(err){
				connectionpool.releaseSQLConnection(connection);  
				console.log('Error connecting to Db');
				return;
			}				 
			var query =  connection.query('insert into userhistory(itemno,itemname,itemdescription,sellerinformation,transactiontype,quantity,itemprice,email,userid,dateposted) select advertisements.itemno,itemname,itemdescription,sellerinformation,\'bought\',cart.quantityselected as quantity,itemprice,ebayuserdetails.email,ebayuserdetails.userid,dateposted from advertisements  INNER JOIN cart ON advertisements.itemno = cart.itemno INNER JOIN ebayuserdetails ON cart.userid = ebayuserdetails.userid where advertisements.quantity >= cart.quantityselected and ebayuserdetails.userid = ? ',req.session.id,function (err, result) {
				if (err) 
				{
					connectionpool.releaseSQLConnection(connection);
					throw err;

				}
				//--
				query =  connection.query('update advertisements inner join cart  on cart.itemno = advertisements.itemno set advertisements.quantity = (advertisements.quantity - cart.quantityselected) where cart.quantityselected <= advertisements.quantity and cart.userid = ?',[req.session.id],function (err, result) {
					if (err) 
					{
						connectionpool.releaseSQLConnection(connection);
						throw err;
					}
					//--
					query =  connection.query('delete from cart where userid = ?',req.session.id,function (err, result) {
						if (err)
						{ 
							connectionpool.releaseSQLConnection(connection);
							throw err;
						}
						//--
						query =  connection.query('delete from advertisements where quantity <= 0',function (err, result) {
							if (err) 
							{
								connectionpool.releaseSQLConnection(connection);
								throw err;
							}
							//-- remove cart items if they are less than actual quantity available
							query =  connection.query('delete from cart where cartno in (select cartno from advertisements inner join (select * from cart) as cart on cart.itemno= advertisements.itemno where cart.quantityselected > advertisements.quantity)',function (err, result){
								if (err) 
								{
									connectionpool.releaseSQLConnection(connection);
									throw err;
								}
								connectionpool.releaseSQLConnection(connection);
							});

							//--
						});	
						//--
					});
					//--
				});   			    		//--
			});
		});
		// delete from cart
		res.render('dashboard', { err: '' });
		//res.send("Payment Successful");
	}		
};
exports.checkout = function(req,res)
{
	res.render('checkout', { title: 'Credit Card Info', cardnameerr:'',cardnumerr: '',invaliddate:'',invalidcvv:'' });
}