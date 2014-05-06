var global = {
	gui: require('nw.gui'),
	fs: require("fs"),
	db_path: "/Users/william/Dropbox/akount/db.json",
	db: _.load("/Users/william/Dropbox/akount/db.json"),
    files_path: "/Users/william/Dropbox/akount/files/",
	Gaze: require('gaze').Gaze,
    crypto: require('crypto'),
    fs: require('fs'),
    path: require('path')
};

if (global.db === null) {
	global.db = {
		expenditure: []
	}
}

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
