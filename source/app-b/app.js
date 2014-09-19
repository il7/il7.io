var Seven = function() { return; };

//=include('vendor/prism.js')

//# include('views/window.js')
//# include('views/document.js')
//# include('views/app-scroller.js')
//# include('views/header.js')
//# include('views/article.js')

Seven.ApplicationView = (function() {
	return Struck.View.extend({
		el: '#application',
		ui: {
			header: '.l-header',
			footer: '.l-footer',
			content: '#application-content',
			article: '.l-article'
		},

		setup: function() {
			var self = this;
			self.state('starting', true);

			_.defer(function() {
				self.vein.trigger('resize');
			});

			_.delay(function() {
				self.state('starting', false);
			}, 500);

      this.setupResize();
      this.setupChildren();
    },

    setupChildren: function() {
      // this.document = new Seven.DocumentView({ el: document });
      // this.scroller = new Seven.AppScrollerView({ el: this.ui.content });
      // this.header = new Seven.HeaderView({ el: this.ui.header });
      
      this.setupPage();
    },

		setupResize: function() {
			$(window).on('resize', _.throttle(_.bind(this.onResize, this), 100));
		},

		onResize: function() {
			this.vein.trigger('resize');
		},

		setupPage: function() {
			if (this.ui.article.length > 0) {
				// this.article = new Seven.ArticleView({ el: this.ui.article });
			}
		}
	});
})();

//=include('startup.js')