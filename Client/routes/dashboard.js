/**
 * New node file
 */


var log = require('./logger');
exports.dashboard = function(req, res){
	console.log('sdsdf');
	log.info('dashboard clicked ', req.body.id ,' performed at ', new Date().toJSON());
	if(req.session.email)
	{
		//Set these headers to notify the browser not to maintain any cache for the page being loaded
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		res.render('dashboard', { err: '' });
	}
	else
	{
		res.redirect('/');
	}	
 
};