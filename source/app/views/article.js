Seven.ArticleView = (function() {
	return Tendon.View.extend({ 
		ui: {
			content: '.content',
			nodes: '.content > *'
		},

		excluded: ['.content-code'],

		onRender: function() {
			this.setupWraps();
		},

		setupWraps: function() {
			var self = this;
			var wrapper = $(document.createElement('div')).addClass('content-wrapper');

			this.ui.wrappedNodes = this.ui.nodes.filter(function(i) {
				var node = $(this);
				return !node.is.apply(node, self.excluded);
			});

			this.ui.wrappedNodes.wrap(wrapper);
		}
	});
})()