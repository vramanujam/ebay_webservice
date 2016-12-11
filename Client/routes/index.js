


exports.index = function(req, res){
  if(req.session.email)
	  res.render('dashboard', {});
  else
	  res.render('index',{ err: '' });
};