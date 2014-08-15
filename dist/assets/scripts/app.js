var Seven = function() { return; };

Seven.WindowView = (function() {
	return Tendon.View.extend({
		events: {
			'resize': 'updateScroll',
			'scroll': 'updateScroll'
		},

		updateScroll: function() {
			var nav = app.header && app.header.height || 50;
			this.pos = this.$el.scrollTop();

			app.state('scrolling', true);
			app.state('scrolled', this.pos > 0);
			app.state('scrolled-nav', this.pos > nav / 4 * 3);
			
			this.updateScrollDirection();
			
			clearTimeout(this.timer);
			this.timer = 
				_.delay(_.bind(this.cleanupScroll, this), 200);
		},

		updateScrollDirection: _.throttle(function () {
			if (this.pos && this.lastPos 
				&& this.pos !== this.lastPos) {
				app.state('scrolled-up', this.pos < this.lastPos);
				app.state('scrolled-down', this.pos > this.lastPos);
			}
			this.lastPos = this.pos;
		}, 200),

		cleanupScroll: function () {
			app.state('scrolling', false);
		}
	});
})()
Seven.DocumentView = (function() {
	return Tendon.View.extend({ });
})()
Seven.HeaderView = (function() {

	return Tendon.View.extend({
		ui: {
			mast: '.l-header-mast',
			wrapper: '.l-header-wrapper',
			logo: '.logo',
			navItems: '.nav-item'
		},
		
		onRender: function() {
			this.setupResize();
		},

		setupResize: function() {
			$(window).on('resize', { self: this }, 
				_.throttle(this.onResize, 250)
			).trigger('resize');
		},

		onResize: function(ev) {
			var self = ev.data.self;

			self.height = self.ui.wrapper.height();
			self.$el.css('height', self.height);

			clearTimeout(this.timer);
			this.timer = _.delay(function() {
				self.onResize(ev);
			}, 250);
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
			this.setupWraps();
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

			article: '.l-article'
		},

		onRender: function() {
			this.window = new Seven.WindowView({ el: window });
			this.document = new Seven.DocumentView({ el: document });
			this.header = new Seven.HeaderView({ el: this.ui.header });

			this.setup();
			this.setupPage();
		},

		setup: function() {
			var self = this;
			self.state('starting', true);

			_.delay(function() {
				self.state('starting', false);
			}, 500);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZXMiOlsiYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBTZXZlbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm47IH07XG5cbi8vPWluY2x1ZGUoJ3ZpZXdzL3dpbmRvdy5qcycpXG4vLz1pbmNsdWRlKCd2aWV3cy9kb2N1bWVudC5qcycpXG4vLz1pbmNsdWRlKCd2aWV3cy9oZWFkZXIuanMnKVxuLy89aW5jbHVkZSgndmlld3MvYXJ0aWNsZS5qcycpXG5cblNldmVuLkFwcGxpY2F0aW9uVmlldyA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIFRlbmRvbi5WaWV3LmV4dGVuZCh7XG5cdFx0ZWw6ICcjYXBwbGljYXRpb24nLFxuXHRcdHVpOiB7XG5cdFx0XHRoZWFkZXI6ICcubC1oZWFkZXInLFxuXHRcdFx0Zm9vdGVyOiAnLmwtZm9vdGVyJyxcblxuXHRcdFx0YXJ0aWNsZTogJy5sLWFydGljbGUnXG5cdFx0fSxcblxuXHRcdG9uUmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMud2luZG93ID0gbmV3IFNldmVuLldpbmRvd1ZpZXcoeyBlbDogd2luZG93IH0pO1xuXHRcdFx0dGhpcy5kb2N1bWVudCA9IG5ldyBTZXZlbi5Eb2N1bWVudFZpZXcoeyBlbDogZG9jdW1lbnQgfSk7XG5cdFx0XHR0aGlzLmhlYWRlciA9IG5ldyBTZXZlbi5IZWFkZXJWaWV3KHsgZWw6IHRoaXMudWkuaGVhZGVyIH0pO1xuXG5cdFx0XHR0aGlzLnNldHVwKCk7XG5cdFx0XHR0aGlzLnNldHVwUGFnZSgpO1xuXHRcdH0sXG5cblx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHRzZWxmLnN0YXRlKCdzdGFydGluZycsIHRydWUpO1xuXG5cdFx0XHRfLmRlbGF5KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzZWxmLnN0YXRlKCdzdGFydGluZycsIGZhbHNlKTtcblx0XHRcdH0sIDUwMCk7XG5cdFx0fSxcblxuXHRcdHNldHVwUGFnZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAodGhpcy51aS5hcnRpY2xlLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0dGhpcy5hcnRpY2xlID0gbmV3IFNldmVuLkFydGljbGVWaWV3KHsgZWw6IHRoaXMudWkuYXJ0aWNsZSB9KTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufSkoKVxuXG4vLz1pbmNsdWRlKCdzdGFydHVwLmpzJykiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=