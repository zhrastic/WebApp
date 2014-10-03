define(function (require) {

    var ko = require('knockout');
    var hub = require('signalr.hubs');
    var app = require('durandal/app');
    var helper = require('services/helper');
    
    var instanca = function () {
        var self = this;

        self.signalRConnection = jQuery.connection;
        self.signalRHub = self.signalRConnection.messageHub;
        self.signalRClient = self.signalRConnection.messageHub.client;
        self.signalRServer = self.signalRConnection.messageHub.server;
        self.signalRHubStarted = false;
        //========================= Module function =========================
        self.signalRClient.notifyAll = function (message) {
            app.trigger('Notification:all', message);
        };
        self.signalRClient.notifyMe = function (message) {
            app.trigger('Notification:me', message);
        };
        self.signalRClient.LoginDone = function (message) {
            if (message.hasError) {
                var note = message.ErErrorMessage.Message + "<br/>hr/>" + message.ErErrorMessage.Details;
                app.trigger('Shell:addNote', note);
            }
        };

        self.init = function() {
            if (!self.signalRHubStarted) {
                self.signalRConnection.hub.start({ transport: ['webSockets', 'serverSentEvents', 'longPolling'] }).done(function () {
                    var name = "Pero" + helper.getRandomInt(1, 100000);
                    self.signalRServer.login(name, "password");
                    self.signalRHubStarted = true;
                });
            }
        };

        //========================= Durandal function =========================
        self.activate = function (activationData) {

        };
    };

    //singleton
    return new instanca();
});