var connectionpool = require('./connectionpool');
var log = require('./logger');
var soap = require('soap');
var baseURL = "http://localhost:8080/ebay_webservice/services";
var option = {
	ignoredNamespaces : true
};
var url = baseURL+"/ebay_services?wsdl";

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
		soap.createClient(url,option, function(err, client) {
			client.payment({userid:req.session.id}, function(err, result) {
				if(err)
				{
					console.log("soap error at signup " + err);
					return;
				}
				if(result.paymentReturn)
				{
					log.info('payment successful ', req.session.id, ' performed at ', new Date().toJSON());
					console.log('payment successful');
				}
			});
		});
		res.render('dashboard', { err: '' });
	}		
};
exports.checkout = function(req,res)
{
	res.render('checkout', { title: 'Credit Card Info', cardnameerr:'',cardnumerr: '',invaliddate:'',invalidcvv:'' });
}