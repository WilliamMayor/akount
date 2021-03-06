/*jshint -W084 */
function ListViewModel(db, Item) {
    var self = this;

    self.visible = ko.observable(true);
    self._new = ko.observable(new Item());
    self._new().editing(true);

    self.all = function() {
        return _.map(db, function(o) {
            console.log(o);
            return new Item(o);
        });
    };

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
    };
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
        };
        return f;
    };
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
            });
        });
        self.items(items);
    };
    self.filter.current = ko.observableArray();

    self.draw = function() {
        self.filter();
        self.sort();
    };

    global.events.subscribe(self._new().changeEvent, function(event, item) {
        self.draw();
    });
}
