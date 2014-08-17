module.exports.register = function (Handlebars, options)  { 
  Handlebars.registerHelper('vp-size', function (type, mod, opts)  { 
  	type = type || 'p';
  	mod = 'text-vp' + (mod ? '-' + mod : '');

	return new Handlebars.SafeString(
     	'<' + type + ' class="' + mod + '" >'
     		+ opts.fn(this) + 
     	'</' + type + '>'
 	);
  });
};