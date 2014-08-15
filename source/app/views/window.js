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