var global;

function ExpenditureItemViewModel(id, date, description, cost, repeat, tags) {
	var self = this;

	self.id = ko.observable(id);
	self.date = ko.observable(date);
	self.description = ko.observable(description);
	self.cost = ko.observable(cost);
	self.repeat = ko.observable(repeat);
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
			repeat: self.repeat(),
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
	self.dirty_repeat = ko.observable();
	self.dirty_tags = ko.observable();

	self.all = function() {
		var items = _.map(global.db.expenditure, function(o) {
			return new ExpenditureItemViewModel(
				o.id,
				o.date,
				o.description,
				o.cost,
				o.repeat,
				o.tags
			);
		});
		var generated = [];
		_.each(items, function(item) {
			if (item.repeat()) {
				var sched = later.schedule(later.parse.cron(item.repeat()));
				var start = Date.parse(item.date()).addDays(1);
				var end = Date.today();
				var dates = sched.next(Number.MAX_VALUE, start, end);
				_.each(dates, function(date) {
					console.log(date);
					generated.push(new ExpenditureItemViewModel(
						-1,
						date.toString("yyyy-MM-dd"),
						"Scheduled: " + item.description(),
						item.cost(),
						null,
						item.tags()
					));
				});
			}
		});
		return _.union(items, generated);
	}

	self.items = ko.observableArray(self.all());

	self.show = function() {
		self.visible(true);
	}
	self.hide = function() {
		self.visible(false);
	}
	self.save = function() {
		var id = self.dirty_id();
		if (!id) {
			var item = new ExpenditureItemViewModel(null, self.dirty_date(), self.dirty_description(), self.dirty_cost(), self.dirty_repeat(), self.dirty_tags());
			item.save();
			self.items.push(item);
		} else if (id !== -1) {
			var item = _.find(self.items(), function(item) {
				return item.id() === id;
			});
			item.date(self.dirty_date());
			item.description(self.dirty_description());
			item.cost(self.dirty_cost());
			item.repeat(self.dirty_repeat());
			item.tags(self.dirty_tags());
			item.save();
		}
		_.save(global.db, global.db_path);

		self.items(self.all());
		self.sort();
		
		self.dirty_id("");
		self.dirty_date("");
		self.dirty_description("");
		self.dirty_cost("");
		self.dirty_repeat("");
		self.dirty_tags("");
	}
	self.load = function(item) {
		self.dirty_id(item.id());
		self.dirty_date(item.date());
		self.dirty_description(item.description());
		self.dirty_cost(item.cost());
		self.dirty_repeat(item.repeat());
		self.dirty_tags(item.tags());
	}
	self.delete = function(item) {
		self.items.remove(item);
		_.remove(global.db.expenditure, item.id());
		_.save(global.db, global.db_path);
	}

	self.sort = function(accessor) {
		if (accessor === self.sort.current()) {
			self.sort.reverse = !self.sort.reverse;
		} else {
			self.sort.reverse = false;
		}
		accessor = accessor || self.sort.current();
		self.items.sort(self.sort.factory(accessor));
		self.sort.current(accessor);
	}
	self.sort.current = ko.observable("date");
	self.sort.reverse = false;
	self.sort.is_num = /^-?\d*\.?\d+$/;
	self.sort.factory = function(accessor) {
		var f = function(l, r) {
			var lv = l[accessor]();
			var rv = r[accessor]();
			if (lv === rv) return 0;
			if (accessor === "cost") {
				lv = +lv;
				rv = +rv;
			}
			if (lv < rv) {
				return self.sort.reverse ? 1 : -1;
			}
			return self.sort.reverse ? -1 : 1;
		}
		return f;
	}
	self.sort();

	self.filter = function(accessor, value) {
		if (_.some(self.filter.current(), function(o) { return o[0] === accessor && o[1] === value; })) {
			self.filter.current(_.reject(self.filter.current(), function(f) {
				return f[0] === accessor && f[1] === value;
			}));
		} else {
			self.filter.current.push([accessor, value]);
		}
		var items = _.filter(self.all(), function(item) {
			return _.every(self.filter.current(), function(f) {
				if (f[0] === "tags") {
					return _.contains(item.split_tags(), f[1]);
				}
				return item[f[0]]() === f[1];
			})
		})
		self.items(items);
	}
	self.filter.current = ko.observableArray();
}

global.expenditures = new ExpendituresViewModel();
ko.applyBindings(global.expenditures, $(".expenditures")[0]);