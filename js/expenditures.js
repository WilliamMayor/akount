var global, ko, _;

function ExpenditureItemViewModel(id, date, description, amount, tags) {
	'use strict';
    var self = this;

	self.id = ko.observable(id);
	self.date = ko.observable(date);
	self.description = ko.observable(description);
	self.amount = ko.observable(amount);
	self.tags = ko.observable(tags);
    
    self.editing = ko.observable(false);

	self.split_tags = ko.computed(function () {
		return _.map(self.tags().split(','), function(value) {
			return value.trim();
		});
	});

	self.save = function() {
		self.editing(false);
	};
    self.edit = function() {
		self.editing(true);
	};
}

function ExpendituresViewModel() {
	var self = this;

	self.visible = ko.observable(true);
    self._new = ko.observable(new ExpenditureItemViewModel(-1,'','','','',''));
    self._new().editing(true);

	self.all = function() {
		var items = _.map(global.db.expenditure, function(o) {
			return new ExpenditureItemViewModel(
				o.id,
				o.date,
				o.description,
				o.amount,
				o.tags
			);
		});
        if (items.length === 0) {
            var d = new Date();
            for (var i=0; i<50; i++) {
                var e = new Date(d.getFullYear(), d.getMonth(), d.getDate()+i);
                items.push(new ExpenditureItemViewModel(
                    i,
                    e.getFullYear() + '/' + e.getMonth() + '/' + e.getDate(),
                    'Purchase ' + i,
                    i * 100,
                    (i % 2 == 0) ? 'a' : 'b'
                ));
            }
        }
		return items;
	}

	self.items = ko.observableArray(self.all());

	self.show = function() {
		self.visible(true);
	}
	self.hide = function() {
		self.visible(false);
	}
	self.save = function() {
		
	}
	self.load = function(item) {
		
	}
	self.delete = function(item) {
		self.items.remove(item);
		_.remove(global.db.expenditure, item.id());
		_.save(global.db, global.db_path);
	}

	self.sort = function(accessor) {
		if (accessor === self.sort.current()) {
			self.sort.reverse(!self.sort.reverse());
		} else {
			self.sort.reverse(false);
		}
		accessor = accessor || self.sort.current();
		self.items.sort(self.sort.factory(accessor));
		self.sort.current(accessor);
	}
	self.sort.current = ko.observable("date");
	self.sort.reverse = ko.observable(false);
	self.sort.is_num = /^-?\d*\.?\d+$/;
	self.sort.factory = function(accessor) {
		var f = function(l, r) {
			var lv = l[accessor]();
			var rv = r[accessor]();
			if (lv === rv) return 0;
			if (accessor === "amount") {
				lv = +lv;
				rv = +rv;
			}
			if (lv < rv) {
				return self.sort.reverse() ? 1 : -1;
			}
			return self.sort.reverse() ? -1 : 1;
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