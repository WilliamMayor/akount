var global;

function SettingsViewModel() {
	var self = this;
	
	self.visible = ko.observable(false);

	self.show = function() {
		self.visible(true);
	}
	self.hide = function() {
		self.visible(false);
	}
}

global.settings = new SettingsViewModel();
ko.applyBindings(global.settings, $(".settings")[0]);