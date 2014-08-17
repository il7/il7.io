module.exports.register = function (Handlebars, options)  { 
  Handlebars.registerHelper('wrap-code', function (lang, opts)  { 
  	if (typeof lang === "object") {
  		opts = lang;
  		lang = undefined;
  	}
  	
  	lang = 'language-' + (lang || 'javascript');

	return new Handlebars.SafeString(
		'<div class="content-code text-vp-small">' 
			+ '<pre class="content-wrapper" data-type="code"><code class="' + lang + '">'
	     		+ opts.fn(this)
	     	+ '</code></pre>' + 
     	'</div>'
 	);
  });
};