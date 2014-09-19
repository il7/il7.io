Seven.WindowView = Patchbay.View.extend({
  el: window,
  
  setup: function() {
    this.listenTo(this.$el, 'resize', _.bind(this.onResize, this));
  },

  onResize: _.throttle(function() {
    this.trigger('resize');
  }, 25)
});