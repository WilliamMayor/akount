var global;

function BackupViewModel() {
	var self = this;
	
	self.visible = ko.observable(false);

	self.show = function() {
		self.visible(true);
	}
	self.hide = function() {
		self.visible(false);
	}
}

global.backup = new BackupViewModel();
ko.applyBindings(global.backup, $(".backup")[0]);