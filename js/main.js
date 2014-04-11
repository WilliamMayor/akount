var global = {
	gui: require('nw.gui'),
	fs: require("fs"),
	db_path: "./db.json",
	db: _.load("./db.json"),

	Gaze: require('gaze').Gaze
};

if (global.db === null) {
	global.db = {
		expenditure: [],
		invoices: []
	}
}

later.date.localTime();

$("header a").click(function(e) {
	var a = $(this);
	var href = a.attr("href");
	if (a.attr("target") === "_blank") {
		global.gui.Shell.openExternal(href);
	} else {
		$.each($("header a"), function(i, value) {
			var a  = $(value);
			if (a.attr("target") !== "_blank") {
				var href = a.attr("href");
				global[href].hide();
			}
		});
		global[href].show();
	}

	e.preventDefault();
	return false;
});
