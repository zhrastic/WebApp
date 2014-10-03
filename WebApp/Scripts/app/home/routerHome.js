define(function (require) {

    var router = require('plugins/router');
    var ko = require('knockout');


    var childRouter = router.createChildRouter()
            .makeRelative({
                moduleId: 'home',
                route: 'home'
            }).map([
                { route: '', moduleId: 'homePage', title: 'Home', nav: false }
            ])
            .buildNavigationModel();

    return {
        router: childRouter
    };
});