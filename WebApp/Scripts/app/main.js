requirejs.config({
    urlArgs: "version=1.0.01",
    paths: {
        'text': '../lib/require/text',
        'durandal': '../lib/durandal/js',
        'plugins': '../lib/durandal/js/plugins',
        'transitions': '../lib/durandal/js/transitions',
        'knockout': '../lib/knockout/knockout-3.1.0',
        'bootstrap': '../lib/bootstrap/js/bootstrap',
        'jquery': '../lib/jquery/jquery-2.1.1',
        'jquery-ui': '../lib/jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.min',
        'jqueryUIDatepicker-hr': '../lib/jquery-ui-1.10.4.custom/development-bundle/ui/i18n/jquery.ui.datepicker-hr',
        'jqueryUIDatepicker-en': '../lib/jquery-ui-1.10.4.custom/development-bundle/ui/i18n/jquery.ui.datepicker-en',
        'knockoutJQuery': '../lib/knockout/knockout-jqueryui.min',
        'signalr.core': '../lib/jquery-signalR-2.1.2/jquery.signalR-2.1.2.min',
        'signalr.hubs': '/signalr/hubs?'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: 'jQuery'
        },
        'jquery-ui': {
            deps: ['jquery'],
            exports: 'jQuery'
        },
        'jqueryUIDatepicker-hr': {
            deps: ['jquery-ui'],
            exports: 'jquery-ui'
        },
        'jqueryUIDatepicker-en': {
            deps: ['jquery-ui'],
            exports: 'jquery-ui'
        },
        'knockoutJQuery': {
            deps: ['jquery-ui', 'knockout']
        },
        'signalr.core': {
            deps: ['jquery'],
            exports: 'jQuery.connection'
        },
        'signalr.hubs': {
            deps: ['signalr.core'],
        }
    }
});

define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'knockout'], function (system, app, viewLocator, ko) {
    //>>excludeStart("build", true);
    system.debug(true);
    //>>excludeEnd("build");

    app.title = 'My App Title';

    //specify which plugins to install and their configuration
    app.configurePlugins({
        router: true,
        dialog: true,
        widget: {
            kinds: ['expander', 'inputDialog', 'grid']
        }
    });

    app.start().then(function () {
        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        //Show the app by setting the root view model for our application.
        app.setRoot('shell');
    });
});