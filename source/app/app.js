var Seven = function() { return; };

//=include('views/header.js')
//=include('window.js')

Seven.ApplicationView = (function() {
	return Tendon.View.extend({
		el: '#application',
		ui: {
			header: '.l-header',
			footer: '.l-footer'
		},

		initialize: function() {
			this.window = new Seven.WindowView({ el: window });
			this.header = new Seven.HeaderView({ el: this.ui.header });
		}


	});
})()

//=include('startup.js')