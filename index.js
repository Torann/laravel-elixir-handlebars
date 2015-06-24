var gulp          = require('gulp'),
    elixir        = require('laravel-elixir'),
    _             = require('underscore'),
    wrap          = require('gulp-wrap'),
    concat        = require('gulp-concat'),
    declare       = require('gulp-declare'),
    handlebars    = require('gulp-handlebars'),
    utilities     = require('laravel-elixir/ingredients/commands/Utilities'),
    notification  = require('laravel-elixir/ingredients/commands/Notification');

elixir.extend('templates', function (src, options) {
    var config = this;

    options = _.extend({
        debug : !config.production,
        srcDir: config.assetsDir,
        outputDir: config.jsOutput,
        outputFile: 'templates.js',
        search: '/**/*.hbs'
    }, options);

    src = "./" + utilities.buildGulpSrc(src + options.search, options.srcDir);

    gulp.task('templates', function () {

        var onError = function (e) {
            new notifications().error(e, 'Handlebars Template Compilation Failed!');
            this.emit('end');
        };

        return gulp.src(src)
            .on('error', onError)
            .pipe(handlebars())
            // Wrap each template function in a call to Handlebars.template
            .pipe(wrap('Handlebars.template(<%= contents %>)'))
            // Declare template functions as properties and sub-properties of exports
            .pipe(declare({
                root       : 'exports',
                noRedeclare: true, // Avoid duplicate declarations
                processName: function (filePath) {
                    return declare.processNameByPath(filePath.replace(options.srcDir + '/', ''));
                }
            }))
            // Concatenate down to a single file
            .pipe(concat(options.outputFile))
            // Add the Handlebars module in the final output
            .pipe(wrap('var Handlebars = require("handlebars");\n <%= contents %>'))
            .pipe(gulp.dest(options.outputDir))
            .pipe(new notification().message('Handlebars Template Compiled'));
    });

    this.registerWatcher('templates', src, 'default');

    return this.queueTask('templates');
});
