Seven.HeaderView = Patchbay.View.extend({
  ui: {
    mast: '.l-header-mast',
    wrapper: '.l-header-wrapper',
    logo: '.logo',
    navItems: '.nav-item'
  },
  
  setup: function() {
    this.window = $(window);
    this.app = window.app;

    this.lastHeight = 0;
    
    this.setupResize();
    this.setupScroll();
  },

  setupResize: function() {
    this.listenTo(this.app.window, 'resize', _.throttle(this.resize, 25));
    this.resize();
  },

  resize: function() {
    this.offsetMax = this.height = this.ui.wrapper.height();

    if (this.lastHeight !== this.height) {
      this.lastHeight = this.height;
      
      this.trigger('resize', this.height);

      clearTimeout(this.timer);
      this.timer = _.delay(_.bind(this.resize, this), 100);
    }
  },

  setupScroll: function() {
    this.offset = 0;

    this.listenTo(this.app.scroller, 'scroll', function(pos, opts) {
      var isPastNav = pos > this.height / 4 * 3;

      this.updateOffset(opts.delta);
      this.offset = isPastNav ? this.offset : 0;
      this.ui.mast.css('transform', 'translate(0, -' +  this.offset + 'px, 0)');
    });

    this.listenTo(this.app.scroller, 'scroll:end', function(pos) {
      var isPastNav = pos > this.height / 4 * 3;
      var isPastCenter = this.offset > this.offsetMax / 2 ;

      this.offset = isPastNav && isPastCenter ? this.offsetMax : 0;
      this.ui.mast.transition({ y: -1 * this.offset }, 200);
    }, this);
  },

  updateOffset: function(delta) {
    var isNeg;

    delta = _.isNaN(delta) ? 0 : delta;
    isNeg = delta < 0 ? true : false;

    delta = Math.abs(delta);
    delta = delta > 4 ? 4 : delta;
    delta = isNeg ? delta * -1 : delta;

    this.offset += delta;
    this.offset = (this.offset > this.offsetMax) ? this.offsetMax : this.offset;
    this.offset = (this.offset < 0) ? 0 : this.offset;
    this.offset = Math.ceil(this.offset);
  }
});