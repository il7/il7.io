module.exports.register = function (Handlebars, options)  { 
  Handlebars.registerHelper('wrap-vp', function (type, mod, opts)  { 
  	type = type || 'p';
  	mod = 'text-vp' + (mod ? '-' + mod : '');

	return new Handlebars.SafeString(
     	'<div class="content-wrapper"><' + type + ' class="' + mod + '" >'
     		+ opts.fn(this) + 
     	'</' + type + '></div>'
 	);
  });
};