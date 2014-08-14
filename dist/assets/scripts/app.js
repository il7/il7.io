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

$(function() {
	window.app = new Seven.ApplicationView();
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZXMiOlsiYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBTZXZlbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm47IH07XG5cbi8vPWluY2x1ZGUoJ3ZpZXdzL2hlYWRlci5qcycpXG5cblNldmVuLkFwcGxpY2F0aW9uVmlldyA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIFRlbmRvbi5WaWV3LmV4dGVuZCh7XG5cdFx0ZWw6ICcjYXBwbGljYXRpb24nLFxuXHRcdHVpOiB7XG5cdFx0XHRoZWFkZXI6ICcubC1oZWFkZXInLFxuXHRcdFx0Zm9vdGVyOiAnLmwtZm9vdGVyJ1xuXHRcdH0sXG5cblx0XHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuaGVhZGVyID0gbmV3IFNldmVuLkhlYWRlclZpZXcoeyBlbDogdGhpcy51aS5oZWFkZXIgfSk7XG5cblx0XHRcdHRoaXMuc2V0dXBTY3JvbGxFdmVudHMoKTtcblx0XHR9LFxuXG5cdFx0c2V0dXBTY3JvbGxFdmVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0dmFyIHBvcywgbGFzdFBvcztcblx0XHRcdHZhciB0aW1pbmcgPSAyMDA7XG5cblx0XHRcdGZ1bmN0aW9uIGNsZWFudXBTY3JvbGwoKSB7XG5cdFx0XHRcdHNlbGYuc3RhdGUoJ3Njcm9sbGluZycsIGZhbHNlKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHVwZGF0ZURpciA9IF8udGhyb3R0bGUoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRpZiAocG9zICYmIGxhc3RQb3MgJiYgcG9zICE9PSBsYXN0UG9zKSB7XG5cdFx0XHRcdFx0c2VsZi5zdGF0ZSgnc2Nyb2xsZWQtdXAnLCBwb3MgPCBsYXN0UG9zKTtcblx0XHRcdFx0XHRzZWxmLnN0YXRlKCdzY3JvbGxlZC1kb3duJywgcG9zID4gbGFzdFBvcyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsYXN0UG9zID0gcG9zO1xuXHRcdFx0fSwgMjAwKTtcblxuXHRcdFx0dmFyIHVwZGF0ZVNjcm9sbCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgbmF2ID0gc2VsZi5oZWFkZXIuaGVpZ2h0O1xuXHRcdFx0XHRcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHNlbGYudGltZXIpO1xuXHRcdFx0XHRzZWxmLnRpbWVyID0gXy5kZWxheShjbGVhbnVwU2Nyb2xsLCB0aW1pbmcpO1xuXG5cdFx0XHRcdHBvcyA9ICQodGhpcykuc2Nyb2xsVG9wKCk7XG5cblx0XHRcdFx0c2VsZi5zdGF0ZSgnc2Nyb2xsaW5nJywgdHJ1ZSk7XG5cdFx0XHRcdHNlbGYuc3RhdGUoJ3Njcm9sbGVkJywgcG9zID4gMCk7XG5cdFx0XHRcdHNlbGYuc3RhdGUoJ3Njcm9sbGVkLW5hdicsIHBvcyA+IG5hdiAvIDQgKiAzKTtcblx0XHRcdFx0dXBkYXRlRGlyKCk7XG5cdFx0XHR9O1xuXG5cdFx0XHQkKHdpbmRvdykub24oJ3Njcm9sbCcsIHVwZGF0ZVNjcm9sbClcblx0XHRcdFx0Lm9uKCdyZXNpemUnLCB1cGRhdGVTY3JvbGwpO1xuXHRcdH1cblxuXG5cdH0pO1xufSkoKVxuXG4vLz1pbmNsdWRlKCdzdGFydHVwLmpzJykiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=