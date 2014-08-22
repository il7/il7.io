var Seven = function() { return; };

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


Seven.WindowView = (function() {
	return Tendon.View.extend({
		events: {
			'resize': 'onResize',
			'scroll': 'onScroll'
		},

		onResize: function() {
			this.updateScroll();
		},

		onScroll: function() {
			this.updateScroll();
		},

		updateScroll: _.throttle(function() {
			var nav = app.header && app.header.height || 50;
			this.pos = this.$el.scrollTop();

			app.state('scrolling', true);
			app.state('scrolled', this.pos > 0);
			app.state('scrolled-nav', this.pos > nav / 4 * 3);
			
			this.updateScrollDirection();
			
			clearTimeout(this.timer);
			this.timer = _.delay(_.bind(this.cleanupScroll, this), 200);
		}, 100),

		updateScrollDirection: function () {
			if (this.pos && this.lastPos && this.pos !== this.lastPos) {			
				if (this.pos < this.lastPos) {
					app.state('scrolled-up', true);
					app.state('scrolled-down', false);
					this.vein.trigger('scrolled:up', this.pos);
				} else {
					app.state('scrolled-up', false);
					app.state('scrolled-down', true);
					this.vein.trigger('scrolled:down', this.pos);
				}
			}

			this.lastPos = this.pos;
		},

		startScroll: function() {
			app.state('scrolling', false);
			this.vein.trigger('scrolling:stop', this.pos);
		},

		cleanupScroll: function () {
			app.state('scrolling', false);
			this.vein.trigger('scrolling:stop', this.pos);
		}
	});
})()
Seven.DocumentView = (function() {
	return Tendon.View.extend({ });
})()
Seven.AppScrollerView = (function() {
	return Tendon.View.extend({
		onRender: function() {
			this.app = window.app;

			this.setupIScroll();
			this.setupListeners();
		},

		setupListeners: function() {
			var self = this;
			this.app.vein.on('header:resize', function(height) {
				this.$el.css('height', window.innerHeight)
					.children().eq(0).css('padding-top', height);

				this.navHeight = height;

				_.defer(function() {
					self.scroll.refresh();
				});
			}, this);
		},

		setupIScroll: function() {
			var self = this;

			this.lastPos = 0;
			this.scroll = new IScroll(this.$el.selector, {
			    eventPassthrough: 'horizontal',
			    scrollbars: 'custom',
			    mouseWheel: true,
			    probeType: 3
			});

			this.scroll.on('scrollStart', _.bind(this.startScroll, this));
			this.scroll.on('scroll', _.bind(this.updateScroll, this));
			this.scroll.on('scrollEnd', _.bind(this.endScroll, this));
		},

		startScroll: function() {
			this.app.state('scrolling', true);
			this.app.vein.trigger('scroll:start', this.pos);
			this.updateScrollDirection();
			this.scroll.refresh();
			clearTimeout(this.timer);
		},

		endScroll: function() {
			var self = this;

			this.app.state('scrolling', false);
			this.app.vein.trigger('scroll:stop', this.pos);
			this.scroll.refresh();

			this.timer = _.delay(function() {
				this.app.vein.trigger('scroll:longstop', self.pos);
			}, 600);
		},

		updateScroll: _.throttle(function() {
			this.pos = -1 * this.scroll.y;

			this.app.vein.trigger('scroll:scrolling', this.pos);

			this.updateScrollState();
			this.updateScrollNav();
			this.updateScrollDirection();

			this.lastPos = this.pos;
		}, 10),

		updateScrollState: function() {
			if (this.pos > 0) {
				this.vein.trigger('scrolled', this.pos);
				this.app.state('scrolled', true);
			} else {
				this.app.state('scrolled', false);
			}
		},

		updateScrollNav: function() {
			if (this.pos > this.navHeight / 4 * 3) {
				this.app.state('scrolled-nav', true);
			} else {
				this.app.state('scrolled-nav', false);
			}
		},

		updateScrollDirection: function() {	
			var dir = this.pos < this.lastPos ? 'up' : 'down';
			
			if (this.dir !== dir) {
				this.dir = dir;
				this.app.state('scrolled-up', this.pos < this.lastPos);
				this.app.state('scrolled-down', this.pos > this.lastPos);
			}

			this.app.vein.trigger('scroll:' + dir, this.pos, {
				direction: dir,
				pos: this.pos,
				lastpos: this.lastPos,
				delta: this.pos - this.lastPos
			});
		},
	});
})();
Seven.HeaderView = (function() {
	return Tendon.View.extend({
		ui: {
			mast: '.l-header-mast',
			wrapper: '.l-header-wrapper',
			logo: '.logo',
			navItems: '.nav-item'
		},
		
		onRender: function() {
			this.app = window.app;

			this.lastHeight = 0;
			
			this.setupResize();
			this.setupScroll();
		},

		setupResize: function() {
			this.app.vein.on('resize', _.throttle(_.bind(this.onResize, this), 100));
		},

		onResize: function() {
			this.offsetMax = this.height = this.ui.wrapper.height();

			if (this.lastHeight !== this.height) {
				this.lastHeight = this.height;
				
				this.app.vein.trigger('header:resize', this.height);

				clearTimeout(this.timer);
				this.timer = _.delay(_.bind(this.onResize, this), 100);
			}
		},

		setupScroll: function() {
			this.offset = 0;
			this.app.vein.on('scroll:up scroll:down', function(pos, opts) {
				this.direction = opts.direction;
				this.updateOffset(_.isNaN(opts.delta) ? 0 : opts.delta);
				this.offset = pos > this.height / 4 * 3 ? this.offset : 0;
				this.ui.mast.css('transform', 'translate(0, -' +  this.offset + 'px, 0)');
			}, this);

			this.app.vein.on('scroll:longstop', function(pos) {
				var pastNav = (pos > this.height / 4 * 3);
				var pastCenter = (this.offset > this.offsetMax / 2);

				this.offset = pastNav && pastCenter ? this.offsetMax : 0;
				this.ui.mast.transition({ y: -1 * this.offset }, 500);
			}, this);
		},

		updateOffset: function(delta) {
			var isNeg = delta < 0 ? true : false;

			delta = Math.abs(delta) / 10;
			delta = delta < 1 ? 1 : delta;
			delta = delta > 10 ? 10 : delta;
			delta = isNeg ? delta * -1 : delta;

			this.offset += delta;
			this.offset = (this.offset > this.offsetMax) ? this.offsetMax : this.offset;
			this.offset = (this.offset < 0) ? 0 : this.offset;
			this.offset = Math.ceil(this.offset);
		}
	});
})()
Seven.ArticleView = (function() {
	return Tendon.View.extend({ 
		ui: {
			content: '.content',
			nodes: '.content > *'
		},

		excluded: ['.content-code'],

		onRender: function() {
			// this.setupWraps();
		},

		setupWraps: function() {
			var self = this;
			var wrapper = $(document.createElement('div')).addClass('content-wrapper');

			this.ui.wrappedNodes = this.ui.nodes.filter(function(i) {
				var node = $(this);
				return !node.is.apply(node, self.excluded);
			});

			this.ui.wrappedNodes.wrap(wrapper);
		}
	});
})()

Seven.ApplicationView = (function() {
	return Tendon.View.extend({
		el: '#application',
		ui: {
			header: '.l-header',
			footer: '.l-footer',
			content: '#application-content',
			article: '.l-article'
		},

		onRender: function() {
			this.document = new Seven.DocumentView({ el: document });
			this.scroller = new Seven.AppScrollerView({ el: this.ui.content });
			
			this.header = new Seven.HeaderView({ el: this.ui.header });

			this.setup();
			this.setupPage();
			this.setupResize();
		},

		setup: function() {
			var self = this;
			self.state('starting', true);

			_.defer(function() {
				self.vein.trigger('resize');
			});

			_.delay(function() {
				self.state('starting', false);
			}, 500);
		},

		setupResize: function() {
			$(window).on('resize', _.throttle(_.bind(this.onResize, this), 100));
		},

		onResize: function() {
			this.vein.trigger('resize');
		},

		setupPage: function() {
			if (this.ui.article.length > 0) {
				this.article = new Seven.ArticleView({ el: this.ui.article });
			}
		}
	});
})()

$(function() {
	window.app = new Seven.ApplicationView();
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZXMiOlsiYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBTZXZlbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm47IH07XG5cbi8vPWluY2x1ZGUoJ3ZlbmRvci9wcmlzbS5qcycpXG5cbi8vPWluY2x1ZGUoJ3ZpZXdzL3dpbmRvdy5qcycpXG4vLz1pbmNsdWRlKCd2aWV3cy9kb2N1bWVudC5qcycpXG4vLz1pbmNsdWRlKCd2aWV3cy9hcHAtc2Nyb2xsZXIuanMnKVxuLy89aW5jbHVkZSgndmlld3MvaGVhZGVyLmpzJylcbi8vPWluY2x1ZGUoJ3ZpZXdzL2FydGljbGUuanMnKVxuXG5TZXZlbi5BcHBsaWNhdGlvblZpZXcgPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiBUZW5kb24uVmlldy5leHRlbmQoe1xuXHRcdGVsOiAnI2FwcGxpY2F0aW9uJyxcblx0XHR1aToge1xuXHRcdFx0aGVhZGVyOiAnLmwtaGVhZGVyJyxcblx0XHRcdGZvb3RlcjogJy5sLWZvb3RlcicsXG5cdFx0XHRjb250ZW50OiAnI2FwcGxpY2F0aW9uLWNvbnRlbnQnLFxuXHRcdFx0YXJ0aWNsZTogJy5sLWFydGljbGUnXG5cdFx0fSxcblxuXHRcdG9uUmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuZG9jdW1lbnQgPSBuZXcgU2V2ZW4uRG9jdW1lbnRWaWV3KHsgZWw6IGRvY3VtZW50IH0pO1xuXHRcdFx0dGhpcy5zY3JvbGxlciA9IG5ldyBTZXZlbi5BcHBTY3JvbGxlclZpZXcoeyBlbDogdGhpcy51aS5jb250ZW50IH0pO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmhlYWRlciA9IG5ldyBTZXZlbi5IZWFkZXJWaWV3KHsgZWw6IHRoaXMudWkuaGVhZGVyIH0pO1xuXG5cdFx0XHR0aGlzLnNldHVwKCk7XG5cdFx0XHR0aGlzLnNldHVwUGFnZSgpO1xuXHRcdFx0dGhpcy5zZXR1cFJlc2l6ZSgpO1xuXHRcdH0sXG5cblx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHRzZWxmLnN0YXRlKCdzdGFydGluZycsIHRydWUpO1xuXG5cdFx0XHRfLmRlZmVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzZWxmLnZlaW4udHJpZ2dlcigncmVzaXplJyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Xy5kZWxheShmdW5jdGlvbigpIHtcblx0XHRcdFx0c2VsZi5zdGF0ZSgnc3RhcnRpbmcnLCBmYWxzZSk7XG5cdFx0XHR9LCA1MDApO1xuXHRcdH0sXG5cblx0XHRzZXR1cFJlc2l6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIF8udGhyb3R0bGUoXy5iaW5kKHRoaXMub25SZXNpemUsIHRoaXMpLCAxMDApKTtcblx0XHR9LFxuXG5cdFx0b25SZXNpemU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy52ZWluLnRyaWdnZXIoJ3Jlc2l6ZScpO1xuXHRcdH0sXG5cblx0XHRzZXR1cFBhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKHRoaXMudWkuYXJ0aWNsZS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdHRoaXMuYXJ0aWNsZSA9IG5ldyBTZXZlbi5BcnRpY2xlVmlldyh7IGVsOiB0aGlzLnVpLmFydGljbGUgfSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn0pKClcblxuLy89aW5jbHVkZSgnc3RhcnR1cC5qcycpIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9