# Laravel Elixir Handlebars

### Install

```sh
$ npm install laravel-elixir-handlebars --save-dev
```

### Example

```javascript
var elixir = require('laravel-elixir');

require('laravel-elixir-handlebars');

elixir(function (mix) {

    // Handlebar templates
    mix.templates([
        'templates/**/*.hbs' // Will search in 'resources/views/templates'
    ]);
});
```