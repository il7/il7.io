Seven.AppScrollerView = (function() {
	return Tendon.View.extend({
		onRender: function() {
			this.setupIScroll();
		},

		setupIScroll: function() {
			this.scroll = new IScroll('#application-content', {
			    mouseWheel: true,
			    scrollbars: 'custom'
			});
		},
	});
})();