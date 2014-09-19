var Seven = {};

//=include('vendor/prism.js')

//=include('views/window.js')
//=include('views/document.js')
//=include('views/app-scroller.js')
//=include('views/header.js')
//=include('views/article.js')

Seven.ApplicationView = Patchbay.View.extend({
  el: '#application',

  ui: {
    header: '.l-header',
    footer: '.l-footer',
    content: '#application-content',
    article: '.l-article'
  },

  setup: function() {
    this.setupChildren();

    this.state('starting', true);
    _.delay(_.bind(this.state, this), 250, 'starting', false);
  },

  setupChildren: function() {
    this.window = Seven.WindowView.create();
    this.document = Seven.DocumentView.create();
    this.scroller = Seven.AppScrollerView.create({ el: this.ui.content });
    this.header = Seven.HeaderView.create({ el: this.ui.header });

    this.setupPage();
  },

  setupPage: function() {
    if (this.ui.article.length > 0) {
      this.article = Seven.ArticleView.create({ el: this.ui.article });
    }
  }
});

//=include('startup.js')