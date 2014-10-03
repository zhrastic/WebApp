define(function (require) {

    var ko = require('knockout');
    var bootstrap = require('bootstrap');
    var router = require('plugins/router');
    var signalR = require('services/signalRService');
    var app = require('durandal/app');
    var loadingProgress = require('services/loadingProgress');
    var locale = require('services/locale');
    var resource = require('services/resources');
    
    // Redirecting from / to first route
    router.guardRoute = function(routeInfo, params, instance){
        if (params.fragment === ''){
            return routeInfo.router.routes[0].hash;
        }
        return true;
    };


    var notificationPolje = ko.observableArray([]);
    var allNotificationPolje = ko.observableArray([]);
    var hasNotifications = ko.computed(function () {
        if (notificationPolje().length > 0) {
            timerStart();
            return "notificationDialog.html";
        }
        return null;
    });

    function currentNotification() {
        var result = "";
        if (notificationPolje().length > 0) {
            result = notificationPolje()[0];
        }
        return result;
    };

    var timer;

    function timerStart() {
        clearTimeout(timer);
        timer = setTimeout(function () {
            if (notificationPolje().length > 0) {
                notificationPolje.shift();
            }
        }, 5000);
    }

    function timerStop() {
        clearTimeout(timer);
    }

    signalR.init();

    var allNotificationLimit = ko.observable(50);

    function addNote(note) {
        var item = {
            vrijeme: new Date(),
            message: note
        };
        
        if (allNotificationPolje().length > allNotificationLimit()) {
            allNotificationPolje.shift();
        }

        allNotificationPolje.push(item);
        notificationPolje.push(note);
    }

    var datum = new Date();
    var godina = datum.getFullYear();

    //========================= Globalne pretplate na evente =========================
    app.on('Notification:all').then(function (message) {
        var note;
        
        if (message.HasError) {

        } else {
            var msgObject = message.MessageObject;
            switch (message.MessageType) {
                case "DateTimeMessage":
                    note = "<b>" + msgObject.TekstPoruke + "</b>: " + msgObject.DateTimeValue;
                    addNote(note);
                    break;
                default:
            }
        }
    });
    app.on('Notification:me').then(function (message) {
        var note;

        if (message.HasError) {

        } else {
            var msgObject = message.MessageObject;
            switch (message.MessageType) {
                case "DateTimeMessage":
                    note = "<b>" + msgObject.TekstPoruke + "</b>: " + msgObject.DateTimeValue;
                    addNote(note);
                    break;
                default:
            }
        }
    });
    app.on('Shell:addNote').then(function (note) {
        addNote(note);
    });


    /*
        vraćamo objekt -> require.js će nam uvijek vratiti kreirani objekt, uvijek isti, jer je return define funkcije objekt. 
        Da je return funkcija, onda bi se kreirala svaki puta nova instanca
    */
    return {
        appTitle: resource('AppTitle'),
        currentYear: ko.observable(godina),
        router: router,
        loadingProgress: loadingProgress,
        isBusy: ko.computed(function () {
            var isNavigating = router.isNavigating();
            var isLoading = loadingProgress.isLoading();

            return isLoading || isNavigating;
        }),
        activate: function () {
            router.map([
                {
                    route: '',
                    moduleId: 'home/routerHome',
                    title: 'Home',
                    nav: false,
                    subRoute: ko.observableArray([])
                },
                {
                    route: 'home*details',
                    hash: '#home',
                    moduleId: 'home/routerHome',
                    title: 'Home',
                    nav: true,
                    subRoute: ko.observableArray([])
                }
            ]).buildNavigationModel();

            return router.activate();
        },
        closeNotifier: function () {
            timerStop();
            if (notificationPolje().length > 0) {
                notificationPolje.shift();
            }
        },
        closeAllNotifier: function () {
            timerStop();
            if (notificationPolje().length > 0) {
                notificationPolje.removeAll();
            }
        },
        notifications: notificationPolje,
        allNotifications: allNotificationPolje,
        hasNotifications: hasNotifications,
        currentNotification: currentNotification,
        allNotificationLimit: allNotificationLimit,
        addNote: addNote,
    };
});