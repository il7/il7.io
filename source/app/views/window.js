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