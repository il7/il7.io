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
				this.app.vein.trigger('scroll:longstop', this.pos);
			}, 1000);
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