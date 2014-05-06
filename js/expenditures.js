var global, ko, _;

function ExpenditureItemViewModel(id, date, description, amount, tags) {
	'use strict';
    var self = this;
    
    self.path = global.files_path + global.crypto
        .createHash("MD5")
        .update("expenditure" + id)
        .digest("hex");

	self.id = ko.observable(id);
	self.date = ko.observable(date);
	self.description = ko.observable(description);
	self.amount = ko.observable(amount);
	self.tags = ko.observable(tags);
    self.files = ko.observableArray([]);
    
    self.editing = ko.observable(false);

	self.split_tags = ko.computed(function () {
		return _.map(self.tags().split(','), function(value) {
			return value.trim();
		});
	});
    
	self.save = function() {
        var i = self.to_object();
        if (self.id() === -1) {
            delete i.id;
            _.insert(global.db.expenditure, i);
            _.save(global.db, global.db_path);
            global.events.publish("expenditureChanged", i);
            self.date("");
            self.description("");
            self.amount("");
            self.tags("");
        } else {
            _.update(global.db.expenditure, i.id, i);
            _.save(global.db, global.db_path);
            global.events.publish("expenditureChanged", self);
            self.editing(false);
        }
	};
    self.remove = function() {
		_.remove(global.db.expenditure, self.id());
		_.save(global.db, global.db_path);
        global.events.publish("expenditureChanged", self);
	};
    self.edit = function() {
        self.list();
        self.editing(true);
        return true;
	};
    self.list = function () {
        global.fs.readdir(self.path, function (err, files) {
            var f = [];
            if (!err) {
                files.map(function (file) {
                    return global.path.join(self.path, file);
                }).filter(function (file) {
                    return global.fs.statSync(file).isFile();
                }).forEach(function (file) {
                    f.push({
                        name: global.path.basename(file),
                        path: file
                    });
                });
            }
            self.files(f);
        });
    };
    self.to_object = function() {
        return {
            id: self.id(),
            date: self.date(),
            description: self.description(),
            amount: self.amount(),
            tags: self.tags()
        };
    }
    self.list();
}

function ExpendituresViewModel() {
	var self = this;

	self.visible = ko.observable(true);
    self._new = ko.observable(new ExpenditureItemViewModel(
        -1,'','','',''));
    self._new().editing(true);

	self.all = function() {
		return _.map(global.db.expenditure, function(o) {
			return new ExpenditureItemViewModel(
				o.id,
				o.date,
				o.description,
				o.amount,
				o.tags
			);
		});
	}

	self.items = ko.observableArray(self.all());

	self.sort = function(accessor) {
		if (accessor === self.sort.current()) {
			self.sort.reverse(!self.sort.reverse());
		} else if (arguments.length === 1) {
			self.sort.reverse(false);
		}
		accessor = accessor || self.sort.current();
		self.items.sort(self.sort.factory(accessor));
		self.sort.current(accessor);
	}
	self.sort.current = ko.observable("date");
	self.sort.reverse = ko.observable(false);
	self.sort.factory = function (accessor) {
        var f = function (l, r) {
            function chunkify(t) {
                var tz = [], x = 0, y = -1, n = 0, i, j;
                while (i = (j = t.charAt(x++)).charCodeAt(0)) {
                    var m = (i == 46 || (i >=48 && i <= 57));
                    if (m !== n) {
                        tz[++y] = "";
                        n = m;
                    }
                    tz[y] += j;
                }
                return tz;
            }
            function cmp(a, b) {
                var aa = chunkify(a);
                var bb = chunkify(b);
                for (x = 0; aa[x] && bb[x]; x++) {
                    if (aa[x] !== bb[x]) {
                        var c = Number(aa[x]), d = Number(bb[x]);
                        if (c == aa[x] && d == bb[x]) {
                            return c - d;
                        } else return (aa[x] > bb[x]) ? 1 : -1;
                    }
                }
                return aa.length - bb.length;
            }
            r = cmp(l[accessor]() + "", r[accessor]() + "");
            if (r === 0) return 0;
            if (r > 0) return self.sort.reverse() ? 1 : -1;
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
		} else if (arguments.length === 2) {
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
    
    self.draw = function() {
        self.filter();
        self.sort();
    }
    
    global.events.subscribe("expenditureChanged", function(event, item) {
        self.draw();
    });
}

global.expenditures = new ExpendituresViewModel();
ko.applyBindings(global.expenditures, $(".expenditures")[0]);