var gulp          = require('gulp'),
    Elixir        = require('laravel-elixir'),
    wrap          = require('gulp-wrap'),
    concat        = require('gulp-concat'),
    declare       = require('gulp-declare'),
    handlebars    = require('gulp-handlebars');

var templatePath = 'resources/views/';

Elixir.extend('templates', function (src, output) {
    new Elixir.Task('templates', function () {

        var paths = prepGulpPaths(src, output);

        this.log(paths.src, paths.output);

        var onError = function (e) {
            new Elixir.Notification('Handlebar Templates Compilation Failed!');
            this.emit('end');
        };

        return gulp.src(paths.src.path)
            .on('error', onError)
            .pipe(handlebars())

            // Wrap each template function in a call to Handlebars.template
            .pipe(wrap('Handlebars.template(<%= contents %>)'))

            // Declare template functions as properties and sub-properties of exports
            .pipe(declare({
                root: 'exports',
                noRedeclare: true, // Avoid duplicate declarations
                processName: function (filePath) {
                    return declare.processNameByPath(filePath.substring(filePath.replace(/\\/g, '/').lastIndexOf('/')+1));
                }
            }))

            // Concatenate down to a single file
            .pipe(concat(paths.output.name))

            // Add the Handlebars module in the final output
            .pipe(wrap('var Handlebars = require("handlebars");\n <%= contents %>'))
            .pipe(gulp.dest(paths.output.baseDir))
            .pipe(new Elixir.Notification('Handlebar Templates Compiled'));
    })
        .watch(templatePath + '/**/*.+(hbs|handebars)');
});


/**
 * Prep the Gulp src and output paths.
 *
 * @param  {string|array} src
 * @param  {string|null}  output
 * @return {object}
 */
var prepGulpPaths = function(src, output) {
    return new Elixir.GulpPaths()
        .src(src, templatePath)
        .output(output || Elixir.config.get('config.js.outputFolder'), 'templates.js');
};