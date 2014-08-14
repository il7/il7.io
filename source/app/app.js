var Seven = function() { return; };

//=include('views/header.js')

Seven.ApplicationView = (function() {
	return Tendon.View.extend({
		el: '#application',
		ui: {
			header: '.l-header',
			footer: '.l-footer'
		},

		initialize: function() {
			this.header = new Seven.HeaderView({ el: this.ui.header });

			this.setupScrollEvents();
		},

		setupScrollEvents: function() {
			var self = this;
			var pos, lastPos;
			var timing = 200;

			function cleanupScroll() {
				self.state('scrolling', false);
			}

			var updateDir = _.throttle(function () {
				if (pos && lastPos && pos !== lastPos) {
					self.state('scrolled-up', pos < lastPos);
					self.state('scrolled-down', pos > lastPos);
				}

				lastPos = pos;
			}, 200);

			var updateScroll = function() {
				var nav = self.header.height;
				
				clearTimeout(self.timer);
				self.timer = _.delay(cleanupScroll, timing);

				pos = $(this).scrollTop();

				self.state('scrolling', true);
				self.state('scrolled', pos > 0);
				self.state('scrolled-nav', pos > nav / 4 * 3);
				updateDir();
			};

			$(window).on('scroll', updateScroll)
				.on('resize', updateScroll);
		}


	});
})()

//=include('startup.js')