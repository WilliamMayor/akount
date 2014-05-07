
var global = {
	gui: require('nw.gui'),
	fs: require("fs"),
	mkdirp: require("mkdirp"),
	db_path: "/Users/william/Dropbox/akount/db.json",
    files_path: "/Users/william/Dropbox/akount/files/",
	Gaze: require('gaze').Gaze,
    crypto: require('crypto'),
    path: require('path'),
    underscore: require('underscore'),
    underscoredb: require('underscore.db'),
    setup: function () {
        global.underscoredb.mixWith(global.underscore);
        if (global.fs.existsSync(global.db_path)) {
            global.db = global.underscore.load(global.db_path);
        }
        if (!global.db) {
            global.db = {
                expenditure: []
            };
        }
    }
};
global.setup();

later.date.localTime();

$("header a").click(function(e) {
	var a = $(this);
	var href = a.attr("href");
	if (a.attr("target") === "_blank") {
		global.gui.Shell.openExternal(href);
	} else {
		$("main").load(href);
	}

	e.preventDefault();
	return false;
});

global.events = {
    subscribe: function(event, fn) {
        $(this).bind(event, fn);
    },
    unsubscribe: function(event, fn) {
        $(this).unbind(event, fn);
    },
    publish: function(event, data) {
        $(this).trigger(event, data);
    }
};

global.rmdir = function(path) {
	if (global.fs.existsSync(path)) {
		global.fs.readdirSync(path).forEach(function(file, index) {
			var curPath = global.path.join(path, file);
			if (global.fs.lstatSync(curPath).isDirectory()) {
				global.rmdir(curPath);
			} else {
				global.fs.unlinkSync(curPath);
			}
		});
		global.fs.rmdirSync(path);
	}
};
