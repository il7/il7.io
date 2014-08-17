module.exports.register = function (Handlebars, options)  { 
  Handlebars.registerHelper('wrap-vp', function (type, mod, opts)  {
  	if (typeof mod === "object") {
  		opts = mod;
  		mod = type;
  		type = undefined;
  	}

  	type = type || 'p'
  	mod = 'text-vp' + (mod ? '-' + mod : '');

  	return new Handlebars.SafeString(
     	'<div class="content-wrapper" data-type="' + type + '">'
        + '<' + type + ' class="' + mod + '">'
        + opts.fn(this) + '</' + type + '></div>'
   	);
  });
};