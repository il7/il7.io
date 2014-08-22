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