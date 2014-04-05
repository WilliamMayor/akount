var global;

function SummaryViewModel() {
	var self = this;
	
	self.visible = ko.observable(false);

	self.show = function() {
		self.visible(true);
	}
	self.hide = function() {
		self.visible(false);
	}
}

global.summary = new SummaryViewModel();
ko.applyBindings(global.summary, $(".summary")[0]);