define(function(require) {

    var ko = require('knockout');
    var app = require('durandal/app');
    var resource = require('services/resources');
    
    var instanca = function() {
        var self = this;
        self.dialogTitle = resource('ErrorDialogTitle');
        self.activate = function(errorMessage) {
            self.errorMessage(errorMessage);
        };
        self.resource = resource;
        self.errorMessage = ko.observable('');
        self.close = function() {
            app.closeDialog(self);
        };
    };

    return instanca;

});