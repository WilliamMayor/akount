var global, ko;

function TakePhotoViewModel() {
    var self = this;

    self.show = ko.observable(false);
    self.name = ko.observable("photo.png");

    self.show.subscribe(function(value) {
        console.log(value);
        if (value) {
            navigator.webkitGetUserMedia(
                {video:true}, self.show_feed, self.close
            );
        } else {
            self.stream.stop();
        }
    });

    self.show_feed = function (stream) {
        self.stream = stream;
        document.getElementById('camFeed').src = webkitURL.createObjectURL(stream);
    };

    self.close = function(err) {
        console.log(err);
        self.show(false);
    };

    self.save = function() {
        var c = document.getElementById('photo');
        var v = document.getElementById('camFeed');
        c.getContext('2d').drawImage(v, 0, 0, 320, 240);
        var dataString = c.toDataURL().split(",")[1];
        var buffer = new Buffer(dataString, 'base64');
        var fullFileName = global.path.join(self.dir, self.name());
        global.mkdirp(self.dir, function(err) {
            if (!err) {
                global.fs.writeFileSync(fullFileName, buffer, "binary");
                self.callback();
                self.show(false);
            }
        });
    };

    self.take_photo = function(dir, callback) {
        self.dir = dir;
        self.callback = callback;
        self.show(true);
    };
}

$("body").append($("<div class='modal'>").load("take_photo.html", function () {
    global.take_photo_vm = new TakePhotoViewModel();
    global.take_photo = global.take_photo_vm.take_photo;
    ko.applyBindings(global.take_photo_vm, $(".modal")[0]);
}));
