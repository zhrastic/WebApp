define(function (require) {

    var ko = require('knockout');
    var app = require('durandal/app');
    var sys = require('durandal/system');
    
    window.onerror = function (errorMessage) {    
        showError(errorMessage);
    };

    function showError(errorMessage) {
        app.showDialog("customDialogs/errorDialog", errorMessage).then(function() {
            sys.log(errorMessage);
        });
    }

    var singleton = function () {
        var self = this;
        self.Error = function(errorMessage) {
            showError(errorMessage);
        };
    };
    
   

    return new singleton();

});