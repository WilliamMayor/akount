var global;

function InvoicesViewModel() {
	var self = this;
	
	self.visible = ko.observable(false);

	self.show = function() {
		self.visible(true);
	}
	self.hide = function() {
		self.visible(false);
	}
}

global.invoices = new InvoicesViewModel();
ko.applyBindings(global.invoices, $(".invoices")[0]);