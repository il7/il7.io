var Seven = function() { return; };

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

Seven.ApplicationView = (function() {
	return Tendon.View.extend({
		el: '#application',
		ui: {
			header: '.l-header',
			footer: '.l-footer'
		},

		initialize: function() {
			this.window = new Seven.WindowView({ el: window });
			this.header = new Seven.HeaderView({ el: this.ui.header });
		}


	});
})()

$(function() {
	window.app = new Seven.ApplicationView();
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZXMiOlsiYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBTZXZlbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm47IH07XG5cbi8vPWluY2x1ZGUoJ3ZpZXdzL2hlYWRlci5qcycpXG4vLz1pbmNsdWRlKCd3aW5kb3cuanMnKVxuXG5TZXZlbi5BcHBsaWNhdGlvblZpZXcgPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiBUZW5kb24uVmlldy5leHRlbmQoe1xuXHRcdGVsOiAnI2FwcGxpY2F0aW9uJyxcblx0XHR1aToge1xuXHRcdFx0aGVhZGVyOiAnLmwtaGVhZGVyJyxcblx0XHRcdGZvb3RlcjogJy5sLWZvb3Rlcidcblx0XHR9LFxuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLndpbmRvdyA9IG5ldyBTZXZlbi5XaW5kb3dWaWV3KHsgZWw6IHdpbmRvdyB9KTtcblx0XHRcdHRoaXMuaGVhZGVyID0gbmV3IFNldmVuLkhlYWRlclZpZXcoeyBlbDogdGhpcy51aS5oZWFkZXIgfSk7XG5cdFx0fVxuXG5cblx0fSk7XG59KSgpXG5cbi8vPWluY2x1ZGUoJ3N0YXJ0dXAuanMnKSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==