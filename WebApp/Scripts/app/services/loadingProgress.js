define(function (require) {

    var ko = require('knockout');
    var sys = require('durandal/system');
    var loadingCounter = ko.observable(0);

    var isLoading = ko.computed(function() {

        if (loadingCounter() > 0) {
            return true;
        }

        return false;

    });

    function LoadStart() {
        var count = loadingCounter();
        count++;
        loadingCounter(count);
    }

    function LoadEnd() {
        var count = loadingCounter();
        count--;
        if (loadingCounter() < 0) {
            count = 0;
        }
        loadingCounter(count);
    }

    function wait (milliseconds) {
        return sys.defer(function (dfd) {
            setTimeout(dfd.resolve, milliseconds);
        }).promise();
    };


    var singleton = function() {
        var self = this;
        self.isLoading = isLoading;
        self.loadingCounter = loadingCounter;
        self.LoadStart = LoadStart;
        self.LoadEnd = LoadEnd;
        self.wait = wait;
    };

    //singleton
    return new singleton();


});