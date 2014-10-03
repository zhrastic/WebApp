define(function (require) {

    var ko = require('knockout');
    var helper = require('services/helper');

    var ugradjeno = ko.observableArray([
        "signalR - Pričekajte koji trenutak i početi će iskakati notifikacije (za sve korisnike i random korisnika)...<br/>Pokrenite u više browsera ili prozora...",
        "web api - Kliknite na gumb dolje za poziv web API (getTime)... Poziv je namjernu usporen na nekoliko sekundi..."
    ]);

    var instanca = function () {
        var self = this;
        self.naslov = ko.observable("Ovo je template za početak izrade Durandal aplikacije");
        self.features = ugradjeno;
        self.serverTime = ko.observable("");
        self.serverTimeLoading = ko.observable(false);
        //========================= Module functions =========================
        self.apiCall = function () {
            self.serverTimeLoading(true);
            helper.executeApiCall("api/time/getTime", "GET", null).then(function(response) {
                var data = response;
                self.serverTime(data.dateTimeValue);
                self.serverTimeLoading(false);
            }).fail(function() {
                self.serverTimeLoading(false);
            });
        };
        self.apiCallWithErrorResponse = function () {
            self.serverTimeLoading(true);
            helper.executeApiCall("api/time/getTimeBLA", "GET", null).then(function (response) {
                var data = response;
                self.serverTime(data.dateTimeValue);
                self.serverTimeLoading(false);
            }).fail(function () {
                self.serverTimeLoading(false);
            });
        };



        //========================= Durandal functions =========================
        self.activate = function (activationData) {
            
        };

        self.compositionComplete = function () {
        };

        self.detached = function () {
        };
    };

    //singleton
    return new instanca();
});