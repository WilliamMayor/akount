var global;

function ExpenditureItemViewModel(id, date, description, cost, tags) {
	var self = this;

	self.id = ko.observable(id);
	self.date = ko.observable(date);
	self.description = ko.observable(description);
	self.cost = ko.observable(cost);
	self.tags = ko.observable(tags);

	self.split_tags = ko.computed(function() {
		return _.map(self.tags().split(','), function(value) {
			return value.trim();
		});
	});

	self.save = function() {
		if (self.id()) {
			_.update(global.db.expenditure, self.id(), self.to_object());
		} else {
			var o = _.insert(global.db.expenditure, self.to_object());
			self.id(o.id);
		}
	}
	self.to_object = function() {
		var o = {
			date: self.date(),
			description: self.description(),
			cost: self.cost(),
			tags: self.tags()
		}
		var id = self.id();
		if (id) {
			o.id = id;
		}
		return o;
	}
}

function ExpendituresViewModel() {
	var self = this;

	self.visible = ko.observable(true);
	self.dirty_id = ko.observable();
	self.dirty_date = ko.observable();
	self.dirty_description = ko.observable();
	self.dirty_cost = ko.observable();
	self.dirty_tags = ko.observable();

	self.items = ko.observableArray(
		_.map(global.db.expenditure, function(o) {
			return new ExpenditureItemViewModel(
				o.id,
				o.date,
				o.description,
				o.cost,
				o.tags
			);
		})
	);

	self.show = function() {
		self.visible(true);
	}
	self.hide = function() {
		self.visible(false);
	}
	self.save = function() {
		var id = self.dirty_id();
		if (!id) {
			var item = new ExpenditureItemViewModel(null, self.dirty_date(), self.dirty_description(), self.dirty_cost(), self.dirty_tags());
			item.save();
			self.items.push(item);
		} else {
			var item = _.find(self.items(), function(item) {
				return item.id() === id;
			});
			item.date(self.dirty_date());
			item.description(self.dirty_description());
			item.cost(self.dirty_cost());
			item.tags(self.dirty_tags());
			item.save();
		}
		_.save(global.db, global.db_path);
		
		self.sort();
		
		self.dirty_id("");
		self.dirty_date("");
		self.dirty_description("");
		self.dirty_cost("");
		self.dirty_tags("");
	}
	self.load = function(item) {
		self.dirty_id(item.id());
		self.dirty_date(item.date());
		self.dirty_description(item.description());
		self.dirty_cost(item.cost());
		self.dirty_tags(item.tags());
	}
	self.delete = function(item) {
		self.items.remove(item);
		_.remove(global.db.expenditure, item.id());
		_.save(global.db, global.db_path);
	}

	self.sort = function(accessor) {
		if (accessor === self.sort.current) {
			self.sort.reverse = !self.sort.reverse;
		} else {
			self.sort.reverse = false;
		}
		accessor = accessor || self.sort.current;
		self.items.sort(self.sort.factory(accessor));
		self.sort.current = accessor;
	}
	self.sort.current = "date";
	self.sort.reverse = false;
	self.sort.factory = function(accessor) {
		var f = function(l, r) {
			if (l[accessor]() === r[accessor]()) return 0;
			if (l[accessor]() < r[accessor]()) {
				return self.sort.reverse ? 1 : -1;
			}
			return self.sort.reverse ? -1 : 1;
		}
		return f;
	}
	self.sort();

	self.filter = function(accessor, value) {
		console.log(accessor, value);
		if (accessor === self.filter.current) {
			self.items(_.map(global.db.expenditure, function(o) {
					return new ExpenditureItemViewModel(
						o.id,
						o.date,
						o.description,
						o.cost,
						o.tags
					);
				})
			);
			self.filter.current = null;
		} else {
			self.items(_.map(_.filter(global.db.expenditure, function(o) {
					return o[accessor] === value || o[accessor].indexOf(value) !== -1;
				}), function(o) {
					return new ExpenditureItemViewModel(
						o.id,
						o.date,
						o.description,
						o.cost,
						o.tags
					);
				})
			);
			self.filter.current = accessor;
		}
	}
	self.filter.current = null;
}

global.expenditures = new ExpendituresViewModel();
ko.applyBindings(global.expenditures, $(".expenditures")[0]);