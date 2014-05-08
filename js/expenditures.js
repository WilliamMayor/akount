var global, ko, _;
_ = global.underscore;

function ExpenditureItemViewModel(model) {
	'use strict';
    var self = this;

	if (model === undefined) {
		model = {};
	}

	self.changeEvent = "ExpenditureItemChanged";

    self.path = global.files_path + global.crypto
        .createHash("MD5")
        .update("expenditure" + model.id)
        .digest("hex");


	self.id = ko.observable(model.id || -1);
	self.date = ko.observable(model.date || "");
	self.description = ko.observable(model.description || "");
	self.amount = ko.observable(model.amount || "");
	self.tags = ko.observable(model.tags || "");
	self.add_file_path = ko.observable();
    self.files = ko.observableArray([]);

    self.editing = ko.observable(false);
	self.open_attachment = function(item) {
		global.gui.Shell.openItem(item.path);
	};
	self.add_file_path.subscribe(function(old_path) {
		var name, new_path, ifd, ofd;
		name = global.path.basename(old_path);
		new_path = global.path.join(self.path, name);
		global.mkdirp(self.path, function(err) {
			if (!err) {
				ofd = global.fs.createReadStream(old_path);
				ifd = global.fs.createWriteStream(new_path);
				ofd.on('end', function() {
					self.list();
				});
				ofd.pipe(ifd);
			}
		});
	});
	self.add_file = function() {
		$('#e_' + self.id()).trigger('click');
	};
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
            global.events.publish(self.changeEvent, i);
            self.date("");
            self.description("");
            self.amount("");
            self.tags("");
        } else {
            _.update(global.db.expenditure, i.id, i);
            _.save(global.db, global.db_path);
            global.events.publish(self.changeEvent, self);
            self.editing(false);
        }
	};
    self.remove = function() {
		global.rmdir(self.path);
		_.remove(global.db.expenditure, self.id());
		_.save(global.db, global.db_path);
        global.events.publish(self.changeEvent, self);
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
    };
    self.take_photo = function() {
		global.take_photo(self.path, self.list);
	};
	self.list();
}

global.expenditures = new ListViewModel(global.db.expenditure, ExpenditureItemViewModel);
ko.applyBindings(global.expenditures, $(".expenditures")[0]);
