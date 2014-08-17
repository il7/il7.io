module.exports.register = function (Handlebars, options)  { 
  Handlebars.registerHelper('wrap', function (type, opts)  { 
  	if (typeof type === "object") {
  		opts = type;
  		type = 'p'
  	}

  	type = type || 'p';

	return new Handlebars.SafeString(
		'<div class="content-wrapper" data-type="' + type + '"><' + type + '>'
     		+ opts.fn(this) + 
     	'</' + type + '></div>'
 	);
  });
};

