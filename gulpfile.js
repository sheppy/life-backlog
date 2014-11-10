var gulp = require("gulp");
var fs = require("fs");
var path = require("path");
var del = require("del");
var browserSync = require("browser-sync");
var bowerFiles = require("main-bower-files");
var merge = require("merge-stream");
var sort = require("sort-stream");
var runSequence = require("run-sequence");


var CONFIG = {
    SRC: {
        //SCSS: "src/assets/scss",
        SCSS_GLOB: "src/assets/scss/**/*.scss",
        MATERIAL: "bower_components/css-material/src",
        COFFEE: "src/assets/coffee",
        COFFEE_GLOB: "src/assets/coffee/**/*.coffee",
        HTML_GLOB: "src/views/**/*.html",
        TEMPLATES_GLOB: "src/templates/**/*.tpl.html"
    },
    DIST: {
        DIR: "dist",
        CSS: "dist/assets/css",
        CSS_GLOB: "assets/css/*.min.css",
        JS: "dist/assets/js",
        JS_GLOB: "dist/assets/js/**/*.min.js",
        JS_INJECT: "assets/js",
        HTML_GLOB: "dist/**/*.html",
        FONT: "dist/assets/font",
        VENDOR: "dist/assets/vendor",
        VENDOR_INJECT: "assets/vendor"
    },
    FILTER: {
        JS: "**/*.js"
    }
};


// Load plugins
var $ = require("gulp-load-plugins")();

var onError = function (err) {
    console.log(err.message);
    this.emit("end");
};


var getFolders = function (dir) {
    return fs.readdirSync(dir)
        .filter(function (file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
};


gulp.task("css", function () {
    return gulp.src(CONFIG.SRC.SCSS_GLOB)
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.sass({
            includePaths: [
                "bower_components/sass-list-maps",
                CONFIG.SRC.MATERIAL + "/assets/scss/material"
            ],
            style: "expanded"
        }))
        .pipe($.autoprefixer("last 2 version", "safari 5", "ie 9", "opera 12.1", "ios 6", "android 4"))
        .pipe($.rename({suffix: ".min"}))
        .pipe($.minifyCss({
            keepSpecialComments: 0,
            keepBreaks: false
        }))
        .pipe(gulp.dest(CONFIG.DIST.CSS))
        .pipe(browserSync.reload({stream: true}));
});


gulp.task("js", function () {
    var folders = getFolders(CONFIG.SRC.COFFEE);

    var streams = folders.map(function (folder) {
        return gulp.src([
                path.join(CONFIG.SRC.COFFEE, folder, folder + ".coffee"),
                path.join(CONFIG.SRC.COFFEE, folder, "*.coffee")
            ])
            .pipe($.plumber({errorHandler: onError}))
            .pipe($.coffeelint())
            .pipe($.coffeelint.reporter("default"))
            .pipe($.coffee({bare: false}).on("error", onError))
            .pipe($.concat(folder + ".js"))
            .pipe($.ngAnnotate())
            .pipe($.rename({suffix: ".min"}))
            .pipe($.uglify())
            .pipe(gulp.dest(CONFIG.DIST.JS));
    });

    return merge(streams);
});


gulp.task("html", function () {
    return gulp.src(CONFIG.SRC.HTML_GLOB)
        .pipe($.plumber({errorHandler: onError}))


        .pipe($.inject(gulp.src(CONFIG.DIST.CSS_GLOB, {
            read: false,
            cwd: CONFIG.DIST.DIR
        }), {addRootSlash: false}))

        .pipe($.inject(gulp.src([
            CONFIG.DIST.VENDOR_INJECT + "/angular.min.js",
            CONFIG.DIST.VENDOR_INJECT + "/**/*.min.js"
        ], {
            read: false,
            cwd: CONFIG.DIST.DIR
        }).pipe(sort(function (a, b) {
            return b - a;
        })), {addRootSlash: false, name: "vendor"}))

        //Bootstrap needs to come last
        .pipe($.inject(gulp.src([
            CONFIG.DIST.JS_INJECT + "/bootstrap.min.js",
            CONFIG.DIST.JS_INJECT + "/**/*.min.js"
        ], {
            read: false,
            cwd: CONFIG.DIST.DIR
        }).pipe($.angularFilesort()), {addRootSlash: false}))

        .pipe(gulp.dest(CONFIG.DIST.DIR));
});


// https://www.npmjs.org/package/gulp-ng-html2js
gulp.task("templates", function () {
    return gulp.src(CONFIG.SRC.TEMPLATES_GLOB)
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe($.ngHtml2js({
            moduleName: "Templates",
            prefix: "templates/"
        }))
        .pipe($.concat("templates.min.js"))
        .pipe($.uglify())
        .pipe(gulp.dest(CONFIG.DIST.JS));
});


gulp.task("fonts", function () {
    return gulp.src([CONFIG.SRC.MATERIAL + "/assets/font/**/*.*"])
        .pipe(gulp.dest(CONFIG.DIST.FONT))
});


gulp.task("bower", function () {
    var jsFilter = $.filter(CONFIG.FILTER.JS);

    return gulp.src(bowerFiles())
        .pipe($.plumber({errorHandler: onError}))
        .pipe(jsFilter)
        .pipe($.rename({suffix: ".min"}))
        .pipe($.uglify())
        .pipe(gulp.dest(CONFIG.DIST.VENDOR))
        .pipe(jsFilter.restore());
});


gulp.task("clean", function (cb) {
    del([CONFIG.DIST.DIR], cb)
});


// Start server
gulp.task("browser-sync", function () {
    browserSync({
        server: {
            baseDir: CONFIG.DIST.DIR,
            directory: true,
            index: "index.html"
        },
        startPath: "/index.html",
        notify: false
    });
});


// Reload all Browsers
gulp.task("bs-reload", function () {
    browserSync.reload();
});


gulp.task("watch", ["browser-sync"], function () {
    // Watch sass files
    gulp.watch(CONFIG.SRC.SCSS_GLOB, ["css"]);

    // Watch coffee files
    gulp.watch(CONFIG.SRC.COFFEE_GLOB, ["js"]);

    // Watch template files
    gulp.watch(CONFIG.SRC.TEMPLATES_GLOB, ["templates"]);

    // Watch html files
    gulp.watch(CONFIG.SRC.HTML_GLOB, ["html"]);

    // Reloading
    gulp.watch(CONFIG.DIST.JS_GLOB, ["bs-reload"]);
    gulp.watch(CONFIG.DIST.HTML_GLOB + "/**/*.html", ["bs-reload"]);
});


gulp.task("build", function (callback) {
    runSequence(
        "clean",
        ["css", "js", "templates", "bower", "fonts"],
        "html",
        callback
    );
});


gulp.task("default", ["build"]);
