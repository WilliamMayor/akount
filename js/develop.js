var global;

(function() {
	var gaze = new global.Gaze(['**/*.js', '**/*.html', '**/*.css']);

	gaze.on('all', function(event, filepath) {
	 	if (location) {
	   		location.reload();
	   	}
	});
    $(".main a")[2].click();
})();