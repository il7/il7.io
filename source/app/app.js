var Seven = function() { return; };

//=include('vendor/prism.js')

//=include('views/window.js')
//=include('views/document.js')
//=include('views/app-scroller.js')
//=include('views/header.js')
//=include('views/article.js')

Seven.ApplicationView = (function() {
	return Tendon.View.extend({
		el: '#application',
		ui: {
			header: '.l-header',
			footer: '.l-footer',
			content: '#application-content',
			article: '.l-article'
		},

		onRender: function() {
			this.header = new Seven.HeaderView({ el: this.ui.header });
			this.window = new Seven.WindowView({ el: window });
			this.document = new Seven.DocumentView({ el: document });
			this.scroller = new Seven.AppScrollerView({ el: this.ui.content });

			this.setup();
			this.setupPage();
		},

		setup: function() {
			var self = this;
			self.state('starting', true);

			_.delay(function() {
				self.state('starting', false);
			}, 500);
		},

		setupPage: function() {
			if (this.ui.article.length > 0) {
				this.article = new Seven.ArticleView({ el: this.ui.article });
			}
		}
	});
})()

//=include('startup.js')