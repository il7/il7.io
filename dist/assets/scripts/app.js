var Seven = {};

/* http://prismjs.com/download.html?themes=prism-okaidia&languages=css+clike+javascript+scss&plugins=line-numbers */
self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function(){

// Private helper vars
var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;

var _ = self.Prism = {
	util: {
		encode: function (tokens) {
			if (tokens instanceof Token) {
				return new Token(tokens.type, _.util.encode(tokens.content));
			} else if (_.util.type(tokens) === 'Array') {
				return tokens.map(_.util.encode);
			} else {
				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
			}
		},

		type: function (o) {
			return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
		},

		// Deep clone a language definition (e.g. to extend it)
		clone: function (o) {
			var type = _.util.type(o);

			switch (type) {
				case 'Object':
					var clone = {};

					for (var key in o) {
						if (o.hasOwnProperty(key)) {
							clone[key] = _.util.clone(o[key]);
						}
					}

					return clone;

				case 'Array':
					return o.slice();
			}

			return o;
		}
	},

	languages: {
		extend: function (id, redef) {
			var lang = _.util.clone(_.languages[id]);

			for (var key in redef) {
				lang[key] = redef[key];
			}

			return lang;
		},

		// Insert a token before another token in a language literal
		insertBefore: function (inside, before, insert, root) {
			root = root || _.languages;
			var grammar = root[inside];
			var ret = {};

			for (var token in grammar) {

				if (grammar.hasOwnProperty(token)) {

					if (token == before) {

						for (var newToken in insert) {

							if (insert.hasOwnProperty(newToken)) {
								ret[newToken] = insert[newToken];
							}
						}
					}

					ret[token] = grammar[token];
				}
			}

			return root[inside] = ret;
		},

		// Traverse a language definition with Depth First Search
		DFS: function(o, callback) {
			for (var i in o) {
				callback.call(o, i, o[i]);

				if (_.util.type(o) === 'Object') {
					_.languages.DFS(o[i], callback);
				}
			}
		}
	},

	highlightAll: function(async, callback) {
		var elements = document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code');

		for (var i=0, element; element = elements[i++];) {
			_.highlightElement(element, async === true, callback);
		}
	},

	highlightElement: function(element, async, callback) {
		// Find language
		var language, grammar, parent = element;

		while (parent && !lang.test(parent.className)) {
			parent = parent.parentNode;
		}

		if (parent) {
			language = (parent.className.match(lang) || [,''])[1];
			grammar = _.languages[language];
		}

		if (!grammar) {
			return;
		}

		// Set language on the element, if not present
		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

		// Set language on the parent, for styling
		parent = element.parentNode;

		if (/pre/i.test(parent.nodeName)) {
			parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
		}

		var code = element.textContent;

		if(!code) {
			return;
		}

		var env = {
			element: element,
			language: language,
			grammar: grammar,
			code: code
		};

		_.hooks.run('before-highlight', env);

		if (async && self.Worker) {
			var worker = new Worker(_.filename);

			worker.onmessage = function(evt) {
				env.highlightedCode = Token.stringify(JSON.parse(evt.data), language);

				_.hooks.run('before-insert', env);

				env.element.innerHTML = env.highlightedCode;

				callback && callback.call(env.element);
				_.hooks.run('after-highlight', env);
			};

			worker.postMessage(JSON.stringify({
				language: env.language,
				code: env.code
			}));
		}
		else {
			env.highlightedCode = _.highlight(env.code, env.grammar, env.language)

			_.hooks.run('before-insert', env);

			env.element.innerHTML = env.highlightedCode;

			callback && callback.call(element);

			_.hooks.run('after-highlight', env);
		}
	},

	highlight: function (text, grammar, language) {
		var tokens = _.tokenize(text, grammar);
		return Token.stringify(_.util.encode(tokens), language);
	},

	tokenize: function(text, grammar, language) {
		var Token = _.Token;

		var strarr = [text];

		var rest = grammar.rest;

		if (rest) {
			for (var token in rest) {
				grammar[token] = rest[token];
			}

			delete grammar.rest;
		}

		tokenloop: for (var token in grammar) {
			if(!grammar.hasOwnProperty(token) || !grammar[token]) {
				continue;
			}

			var patterns = grammar[token];
			patterns = (_.util.type(patterns) === "Array") ? patterns : [patterns];

			for (var j = 0; j < patterns.length; ++j) {
				var pattern = patterns[j],
					inside = pattern.inside,
					lookbehind = !!pattern.lookbehind,
					lookbehindLength = 0;

				pattern = pattern.pattern || pattern;

				for (var i=0; i<strarr.length; i++) { // Don’t cache length as it changes during the loop

					var str = strarr[i];

					if (strarr.length > text.length) {
						// Something went terribly wrong, ABORT, ABORT!
						break tokenloop;
					}

					if (str instanceof Token) {
						continue;
					}

					pattern.lastIndex = 0;

					var match = pattern.exec(str);

					if (match) {
						if(lookbehind) {
							lookbehindLength = match[1].length;
						}

						var from = match.index - 1 + lookbehindLength,
							match = match[0].slice(lookbehindLength),
							len = match.length,
							to = from + len,
							before = str.slice(0, from + 1),
							after = str.slice(to + 1);

						var args = [i, 1];

						if (before) {
							args.push(before);
						}

						var wrapped = new Token(token, inside? _.tokenize(match, inside) : match);

						args.push(wrapped);

						if (after) {
							args.push(after);
						}

						Array.prototype.splice.apply(strarr, args);
					}
				}
			}
		}

		return strarr;
	},

	hooks: {
		all: {},

		add: function (name, callback) {
			var hooks = _.hooks.all;

			hooks[name] = hooks[name] || [];

			hooks[name].push(callback);
		},

		run: function (name, env) {
			var callbacks = _.hooks.all[name];

			if (!callbacks || !callbacks.length) {
				return;
			}

			for (var i=0, callback; callback = callbacks[i++];) {
				callback(env);
			}
		}
	}
};

var Token = _.Token = function(type, content) {
	this.type = type;
	this.content = content;
};

Token.stringify = function(o, language, parent) {
	if (typeof o == 'string') {
		return o;
	}

	if (Object.prototype.toString.call(o) == '[object Array]') {
		return o.map(function(element) {
			return Token.stringify(element, language, o);
		}).join('');
	}

	var env = {
		type: o.type,
		content: Token.stringify(o.content, language, parent),
		tag: 'span',
		classes: ['token', o.type],
		attributes: {},
		language: language,
		parent: parent
	};

	if (env.type == 'comment') {
		env.attributes['spellcheck'] = 'true';
	}

	_.hooks.run('wrap', env);

	var attributes = '';

	for (var name in env.attributes) {
		attributes += name + '="' + (env.attributes[name] || '') + '"';
	}

	return '<' + env.tag + ' class="' + env.classes.join(' ') + '" ' + attributes + '>' + env.content + '</' + env.tag + '>';

};

if (!self.document) {
	if (!self.addEventListener) {
		// in Node.js
		return self.Prism;
	}
 	// In worker
	self.addEventListener('message', function(evt) {
		var message = JSON.parse(evt.data),
		    lang = message.language,
		    code = message.code;

		self.postMessage(JSON.stringify(_.tokenize(code, _.languages[lang])));
		self.close();
	}, false);

	return self.Prism;
}

// Get current script and highlight
var script = document.getElementsByTagName('script');

script = script[script.length - 1];

if (script) {
	_.filename = script.src;

	if (document.addEventListener && !script.hasAttribute('data-manual')) {
		document.addEventListener('DOMContentLoaded', _.highlightAll);
	}
}

return self.Prism;

})();

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Prism;
}
;
Prism.languages.css = {
	'comment': /\/\*[\w\W]*?\*\//g,
	'atrule': {
		pattern: /@[\w-]+?.*?(;|(?=\s*{))/gi,
		inside: {
			'punctuation': /[;:]/g
		}
	},
	'url': /url\((["']?).*?\1\)/gi,
	'selector': /[^\{\}\s][^\{\};]*(?=\s*\{)/g,
	'property': /(\b|\B)[\w-]+(?=\s*:)/ig,
	'string': /("|')(\\?.)*?\1/g,
	'important': /\B!important\b/gi,
	'punctuation': /[\{\};:]/g,
	'function': /[-a-z0-9]+(?=\()/ig
};

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'style': {
			pattern: /<style[\w\W]*?>[\w\W]*?<\/style>/ig,
			inside: {
				'tag': {
					pattern: /<style[\w\W]*?>|<\/style>/ig,
					inside: Prism.languages.markup.tag.inside
				},
				rest: Prism.languages.css
			}
		}
	});
};
Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\w\W]*?\*\//g,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*?(\r?\n|$)/g,
			lookbehind: true
		}
	],
	'string': /("|')(\\?.)*?\1/g,
	'class-name': {
		pattern: /((?:(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/ig,
		lookbehind: true,
		inside: {
			punctuation: /(\.|\\)/
		}
	},
	'keyword': /\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/g,
	'boolean': /\b(true|false)\b/g,
	'function': {
		pattern: /[a-z0-9_]+\(/ig,
		inside: {
			punctuation: /\(/
		}
	},
	'number': /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,
	'operator': /[-+]{1,2}|!|<=?|>=?|={1,3}|&{1,2}|\|?\||\?|\*|\/|\~|\^|\%/g,
	'ignore': /&(lt|gt|amp);/gi,
	'punctuation': /[{}[\];(),.:]/g
};
;
Prism.languages.javascript = Prism.languages.extend('clike', {
	'keyword': /\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|function|get|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|set|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)\b/g,
	'number': /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?|NaN|-?Infinity)\b/g
});

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,
		lookbehind: true
	}
});

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'script': {
			pattern: /<script[\w\W]*?>[\w\W]*?<\/script>/ig,
			inside: {
				'tag': {
					pattern: /<script[\w\W]*?>|<\/script>/ig,
					inside: Prism.languages.markup.tag.inside
				},
				rest: Prism.languages.javascript
			}
		}
	});
}
;
Prism.languages.scss = Prism.languages.extend('css', {
	'comment': {
		pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|\/\/.*?(\r?\n|$))/g,
		lookbehind: true
	},
	// aturle is just the @***, not the entire rule (to highlight var & stuffs)
	// + add ability to highlight number & unit for media queries
	'atrule': /@[\w-]+(?=\s+(\(|\{|;))/gi,
	// url, compassified
	'url': /([-a-z]+-)*url(?=\()/gi,
	// CSS selector regex is not appropriate for Sass
	// since there can be lot more things (var, @ directive, nesting..)
	// a selector must start at the end of a property or after a brace (end of other rules or nesting)
	// it can contain some caracters that aren't used for defining rules or end of selector, & (parent selector), or interpolated variable
	// the end of a selector is found when there is no rules in it ( {} or {\s}) or if there is a property (because an interpolated var
	// can "pass" as a selector- e.g: proper#{$erty})
	// this one was ard to do, so please be careful if you edit this one :)
	'selector': /([^@;\{\}\(\)]?([^@;\{\}\(\)]|&|\#\{\$[-_\w]+\})+)(?=\s*\{(\}|\s|[^\}]+(:|\{)[^\}]+))/gm
});

Prism.languages.insertBefore('scss', 'atrule', {
	'keyword': /@(if|else if|else|for|each|while|import|extend|debug|warn|mixin|include|function|return|content)|(?=@for\s+\$[-_\w]+\s)+from/i
});

Prism.languages.insertBefore('scss', 'property', {
	// var and interpolated vars
	'variable': /((\$[-_\w]+)|(#\{\$[-_\w]+\}))/i
});

Prism.languages.insertBefore('scss', 'ignore', {
	'placeholder': /%[-_\w]+/i,
	'statement': /\B!(default|optional)\b/gi,
	'boolean': /\b(true|false)\b/g,
	'null': /\b(null)\b/g,
	'operator': /\s+([-+]{1,2}|={1,2}|!=|\|?\||\?|\*|\/|\%)\s+/g
});


Seven.WindowView = Patchbay.View.extend({
  el: window,
  
  setup: function() {
    this.listenTo(this.$el, 'resize', _.bind(this.onResize, this));
  },

  onResize: _.throttle(function() {
    this.trigger('resize');
  }, 25)
});
Seven.DocumentView = Patchbay.View.extend({
  el: document
});
Seven.AppScrollerView = (function() {
	return Patchbay.View.extend({
		setup: function() {
			this.app = window.app;

			this.setupIScroll();
			this.setupListeners();
		},

		setupListeners: function() {
      this.navHeight = 80;
			this.listenTo(this.app.header, 'resize', this.onHeaderResize);
		},

    onHeaderResize: function(height) {
      var self = this;

      this.$el.css('height', window.innerHeight)
        .children().eq(0).css('padding-top', height);

      this.navHeight = height;

      _.defer(function() {
        self.scroll.refresh();
      });
    },

		setupIScroll: function() {
			this.lastPos = 0;
			this.scroll = new IScroll(this.el, {
			    eventPassthrough: 'horizontal',
			    scrollbars: 'custom',
			    mouseWheel: true,
			    probeType: 3
			});

			this.scroll.on('scrollStart', _.bind(this.scrollStart, this));
			this.scroll.on('scroll', _.bind(this.scrollUpdate, this));
			this.scroll.on('scrollEnd', _.bind(this.scrollEnd, this));
		},

    cleanup: function() {
      this.scroll.destroy();
    },

		scrollStart: function() {
			clearTimeout(this.timer);
      this.updateScrollDirection();
      
      this.app.state('scrolling', true);
      this.hook('scroll', 'start', this.pos);
		},

		scrollEnd: function() {
			this.app.state('scrolling', false);
			this.hook('scroll', 'end', this.pos);
		},

		scrollUpdate: _.throttle(function() {
			this.pos = -1 * this.scroll.y;

			this.updateScrollState();
			this.updateScrollNav();
			this.updateScrollDirection();

      this.delta = this.pos - this.lastPos;
			this.lastPos = this.pos;

      this.trigger('scroll', this.pos, {
        direction: this.dir,
        lastpos: this.lastPos,
        delta: this.delta
      });
		}, 20),

		updateScrollState: function() {
			this.trigger('scrolled', this.pos > 0);
			this.app.state('scrolled', this.pos > 0);
		},

		updateScrollNav: function() {
      this.trigger('scrolled:nav', this.pos > this.navHeight / 4 * 3);
			this.app.state('scrolled-nav', this.pos > this.navHeight / 4 * 3);
		},

		updateScrollDirection: function() {	
			var isDir = this.pos < this.lastPos,
        dir = isDir ? 'up' : 'down';

			if (this.dir !== dir) {
				this.dir = dir;

				this.app.state('scrolled-up', isDir);
				this.app.state('scrolled-down', !isDir);
			}
		}
	});
})();
Seven.HeaderView = Patchbay.View.extend({
	ui: {
		mast: '.l-header-mast',
		wrapper: '.l-header-wrapper',
		logo: '.logo',
		navItems: '.nav-item'
	},
	
	setup: function() {
    this.window = $(window);
		this.app = window.app;

		this.lastHeight = 0;
		
		this.setupResize();
		this.setupScroll();
	},

	setupResize: function() {
    this.listenTo(this.app.window, 'resize', _.throttle(this.resize, 25));
    this.resize();
	},

	resize: function() {
    this.offsetMax = this.height = this.ui.wrapper.height();

		if (this.lastHeight !== this.height) {
			this.lastHeight = this.height;
			
			this.trigger('resize', this.height);

			clearTimeout(this.timer);
			this.timer = _.delay(_.bind(this.resize, this), 100);
		}
	},

	setupScroll: function() {
		this.offset = 0;

    this.listenTo(this.app.scroller, 'scroll', function(pos, opts) {
			var isPastNav = pos > this.height / 4 * 3;

			this.updateOffset(opts.delta);
			this.offset = isPastNav ? this.offset : 0;
			this.ui.mast.css('transform', 'translate(0, -' +  this.offset + 'px, 0)');
    });

		this.listenTo(this.app.scroller, 'scroll:end', function(pos) {
      var isPastNav = pos > this.height / 4 * 3;
			var isPastCenter = this.offset > this.offsetMax / 2 ;

			this.offset = isPastNav && isPastCenter ? this.offsetMax : 0;
			this.ui.mast.transition({ y: -1 * this.offset }, 200);
		}, this);
	},

	updateOffset: function(delta) {
		var isNeg;

		delta = _.isNaN(delta) ? 0 : delta;
		isNeg = delta < 0 ? true : false;

		delta = Math.abs(delta);
    delta = delta > 4 ? 4 : delta;
		delta = isNeg ? delta * -1 : delta;

		this.offset += delta;
		this.offset = (this.offset > this.offsetMax) ? this.offsetMax : this.offset;
		this.offset = (this.offset < 0) ? 0 : this.offset;
		this.offset = Math.ceil(this.offset);
	}
});
Seven.ArticleView = Patchbay.View.extend({ 
	ui: {
		content: '.content',
		nodes: '.content > *'
	},

  setup: function() {

  }
});

Seven.ApplicationView = Patchbay.View.extend({
	el: '#application',

	ui: {
		header: '.l-header',
		footer: '.l-footer',
		content: '#application-content',
		article: '.l-article'
	},

	setup: function() {
    this.setupChildren();

    this.state('starting', true);
    _.delay(_.bind(this.state, this), 250, 'starting', false);
  },

  setupChildren: function() {
    this.window = Seven.WindowView.create();
    this.document = Seven.DocumentView.create();
    this.scroller = Seven.AppScrollerView.create({ el: this.ui.content });
    this.header = Seven.HeaderView.create({ el: this.ui.header });

    this.setupPage();
  },

	setupPage: function() {
		if (this.ui.article.length > 0) {
			this.article = Seven.ArticleView.create({ el: this.ui.article });
		}
	}
});

$(function() {
	window.app = Seven.ApplicationView.create();
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZXMiOlsiYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBTZXZlbiA9IHt9O1xuXG4vLz1pbmNsdWRlKCd2ZW5kb3IvcHJpc20uanMnKVxuXG4vLz1pbmNsdWRlKCd2aWV3cy93aW5kb3cuanMnKVxuLy89aW5jbHVkZSgndmlld3MvZG9jdW1lbnQuanMnKVxuLy89aW5jbHVkZSgndmlld3MvYXBwLXNjcm9sbGVyLmpzJylcbi8vPWluY2x1ZGUoJ3ZpZXdzL2hlYWRlci5qcycpXG4vLz1pbmNsdWRlKCd2aWV3cy9hcnRpY2xlLmpzJylcblxuU2V2ZW4uQXBwbGljYXRpb25WaWV3ID0gUGF0Y2hiYXkuVmlldy5leHRlbmQoe1xuXHRlbDogJyNhcHBsaWNhdGlvbicsXG5cblx0dWk6IHtcblx0XHRoZWFkZXI6ICcubC1oZWFkZXInLFxuXHRcdGZvb3RlcjogJy5sLWZvb3RlcicsXG5cdFx0Y29udGVudDogJyNhcHBsaWNhdGlvbi1jb250ZW50Jyxcblx0XHRhcnRpY2xlOiAnLmwtYXJ0aWNsZSdcblx0fSxcblxuXHRzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXR1cENoaWxkcmVuKCk7XG5cbiAgICB0aGlzLnN0YXRlKCdzdGFydGluZycsIHRydWUpO1xuICAgIF8uZGVsYXkoXy5iaW5kKHRoaXMuc3RhdGUsIHRoaXMpLCAyNTAsICdzdGFydGluZycsIGZhbHNlKTtcbiAgfSxcblxuICBzZXR1cENoaWxkcmVuOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLndpbmRvdyA9IFNldmVuLldpbmRvd1ZpZXcuY3JlYXRlKCk7XG4gICAgdGhpcy5kb2N1bWVudCA9IFNldmVuLkRvY3VtZW50Vmlldy5jcmVhdGUoKTtcbiAgICB0aGlzLnNjcm9sbGVyID0gU2V2ZW4uQXBwU2Nyb2xsZXJWaWV3LmNyZWF0ZSh7IGVsOiB0aGlzLnVpLmNvbnRlbnQgfSk7XG4gICAgdGhpcy5oZWFkZXIgPSBTZXZlbi5IZWFkZXJWaWV3LmNyZWF0ZSh7IGVsOiB0aGlzLnVpLmhlYWRlciB9KTtcblxuICAgIHRoaXMuc2V0dXBQYWdlKCk7XG4gIH0sXG5cblx0c2V0dXBQYWdlOiBmdW5jdGlvbigpIHtcblx0XHRpZiAodGhpcy51aS5hcnRpY2xlLmxlbmd0aCA+IDApIHtcblx0XHRcdHRoaXMuYXJ0aWNsZSA9IFNldmVuLkFydGljbGVWaWV3LmNyZWF0ZSh7IGVsOiB0aGlzLnVpLmFydGljbGUgfSk7XG5cdFx0fVxuXHR9XG59KTtcblxuLy89aW5jbHVkZSgnc3RhcnR1cC5qcycpIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9