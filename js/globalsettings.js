var gloabl;

function GlobalSettingsViewModel() {
	var self = this;
	
	self.visible = ko.observable(false);

	self.show = function() {
		self.visible(true);
	}
	self.hide = function() {
		self.visible(false);
	}
}

global.globalsettings = new GlobalSettingsViewModel();
ko.applyBindings(global.globalsettings, $(".globalsettings")[0]);