
var CronJob = require('cron').CronJob;
var connectionpool = require('./connectionpool');
var bidlog = require('./bidlogger');

var soap = require('soap');
var baseURL = "http://localhost:8080/ebay_webservice/services";
var option = {
	ignoredNamespaces : true
};
var url = baseURL+"/ebay_services?wsdl";
/*function updateBidToUserHistory(detail)
{
	connectionpool.getConnection(function(err,conn){
		conn.query('INSERT INTO userhistory SET ?', detail, function(err, result) {
			if(err)
				console.log(err);
			connectionpool.releaseSQLConnection(conn);
		 			
		 });
	});
	
}*/
var job = new CronJob('50 * * * * *', function() {
    ///console.log('You will see this message every second');
	// select ad with bid whose time has expired
	// SELECT * FROM advertisements WHERE dateposted >= NOW() - INTERVAL 4 DAY and bidding = 'true'
	
	// for each ad get the bidders .... add the item to the top bidders
	// quantity = rows[0].quantity
	// select * from bid where itemno = rows[0] order by price DESC
	// if(quanty > bidrows.quantityselected) reduce quantity, move the ad to the user history
	
	
	// finally remove all the bids with the itemo no and remove the ad from advertisements

	soap.createClient(url,option, function(err, client) {
		client.bidding({}, function(err, result) {
			console.log(result);
			if(err)
			{
				console.log("soap error at signup " + err);
				return;
			}
			if(result.biddingReturn === true){
				console.log();
				bidlog.info('bid daemon run  performed at ', new Date().toJSON());
			}
			else{
				console.log("post ad failed " + err);
			}
		});
	});
	/*console.log("test");connectionpool.getConnection(function(err,connection){
		if(err){
			connectionpool.releaseSQLConnection(connection);
			console.log('Error connecting to Db');
			return;
		}
		connection.query('SELECT * FROM advertisements WHERE dateposted <= NOW() - INTERVAL 5 minute and bidding = \'true\'' , function(err, rows, fields) {

			if (!err)
			{
				console.log('The solution is: '+  (parseInt(rows.length)-1) + ' ' + JSON.stringify(rows[0]));
				//connection.end(function(err) {});
				if(rows.length == 0)
					connectionpool.releaseSQLConnection(connection);
				for(var row in rows)
				{
					var quantity = rows[row].quantity;
					console.log('[3] ' + JSON.stringify(row) + ' ' + quantity);
					connection.query('select * from bid where itemno = ? order by bidplaced DESC ,quantityselected DESC',[rows[row].itemno] , (function(quantity_snapshot,row_snaphot){console.log("[7]");return function(err, bids, fields) {
						console.log(err + " [8]");
						if (!err)
						{
							console.log('[4]' + JSON.stringify(bids) + " " +bids.length);
							if(bids.length == 0)
							{
								connection.query('DELETE FROM advertisements WHERE itemno = ?',row_snaphot.itemno, function (err, result) {
									if (err)
									{
										connectionpool.releaseSQLConnection(connection);
										throw err;
									}
									connectionpool.releaseSQLConnection(connection);
									console.log("[3] " + row_snaphot.itemno);
								});
							}

							var deleteflag = false;
							for(var bid in bids)
							{
								console.log('[5] ' + quantity_snapshot);

								if(bids[bid].quantityselected <= quantity_snapshot)
								{
									console.log('[6]');
									var post = new Object();
									post.itemno = row_snaphot.itemno;
									post.itemname = row_snaphot.itemname;
									post.itemdescription = row_snaphot.itemdescription;
									post.transactiontype = 'Bought';
									post.sellerinformation = row_snaphot.sellerinformation;
									post.quantity = parseInt(bids[bid].quantityselected);
									post.itemprice = parseFloat(bids[bid].bidplaced);
									//post.bidding = req.body.bidding;
									post.email = null;
									post.userid = bids[bid].userid;
									bidlog.info('bid won by ', post.userid , ' performed at ', new Date().toJSON(), ' for item ',post.itemno, ' amount placed ',post.itemprice, ' quantity selected ',post.quantity);
									//update to user history'
									updateBidToUserHistory(post);
									if(deleteflag == false)
									{
										connection.query('DELETE FROM bid WHERE itemno = ? ',row_snaphot.itemno, function (err, result) {
											if (err)
											{
												connectionpool.releaseSQLConnection(connection);
												throw err;
											}
											console.log("[2] " + row_snaphot.itemno);
											connection.query('DELETE FROM advertisements WHERE itemno = ?',row_snaphot.itemno, function (err, result) {
												if (err)
												{
													connectionpool.releaseSQLConnection(connection);
													throw err;
												}
												//connectionpool.releaseSQLConnection(connection);
												console.log("[3] " + row_snaphot.itemno);
											});
										});
										deleteflag = true;
									}
									quantity_snapshot = quantity_snapshot - bids[bid].quantityselected;
								}
								else
									bidlog.info('bid lost by ', bids[bid].userid , ' performed at ', new Date().toJSON(), ' for item ',row_snaphot.itemno, ' amount placed ',bids[bid].bidplaced, ' quantity selected ',bids[bid].quantityselected);
							}

							//console.log('The solution is: '+ rows.length + ' ' + JSON.stringify(rows[0]));


								   	     //connection.end(function(err) {});
    	   	 }
    	   	 }})(quantity,rows[row]));
	     }
	     //---
	     
	     //---
	  }
	  else
	  {
		  connectionpool.releaseSQLConnection(connection);
		  console.log('Error while performing Query.');
	  }
	});
	});*/
	
	
	
}, null, true, 'America/Los_Angeles');
