var gulp          = require('gulp'),
    elixir        = require('laravel-elixir'),
    merge         = require('merge-stream'),
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
        declareSrcDir: true,
        search: '/**/*.hbs'
    }, options);

    var watchPath = options.srcDir + options.search;

    config.saveTask('templates', {
        src: utilities.buildGulpSrc(src, options.srcDir),
        options: options
    });

    gulp.task('templates', function () {

        var dataSet = config.collections['templates'];

        var onError = function (e) {
            new notification().error(e, 'Handlebar Templates Compilation Failed!');
            this.emit('end');
        };

        return merge.apply(this, dataSet.map(function(data) {

            var options = data.options;

            return gulp.src(data.src + options.search)
                .on('error', onError)
                .pipe(handlebars())
                // Wrap each template function in a call to Handlebars.template
                .pipe(wrap('Handlebars.template(<%= contents %>)'))
                // Declare template functions as properties and sub-properties of exports
                .pipe(declare({
                    root: 'exports',
                    noRedeclare: true, // Avoid duplicate declarations
                    processName: function (filePath) {
                        return declare.processNameByPath(filePath.replace(data.src, ''));
                    }
                }))
                // Concatenate down to a single file
                .pipe(concat(options.outputFile))
                // Add the Handlebars module in the final output
                .pipe(wrap('var Handlebars = require("handlebars");\n <%= contents %>'))
                .pipe(gulp.dest(options.outputDir))
                .pipe(new notification().message('Handlebar Templates Compiled'));
        }));
    });

    return config
        .registerWatcher('templates', watchPath)
        .queueTask('templates');
});
