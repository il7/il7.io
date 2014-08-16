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