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