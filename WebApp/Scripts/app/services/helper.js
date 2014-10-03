define(function (require) {

    var $ = require('jquery');
    var errorHandler = require('services/errorHandler');
    var loadingProgress = require('services/loadingProgress');
    var instanca = function() {
        var self = this;
        // Returns a random number between 0 (inclusive) and 1 (exclusive)
        self.getRandom = function() {
            return Math.random();
        };
        // Returns a random number between min (inclusive) and max (exclusive)
        self.getRandomArbitrary = function(min, max) {
            return Math.random() * (max - min) + min;
        };
        self.getRandomInt = function(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        };
        self.executeApiCall = function (url, httpMethod, data) {
            loadingProgress.LoadStart();
            var promise = $.Deferred();
            var ajax = $.ajax({
                url: url,
                contentType: 'application/json; charset=utf-8',
                cache: false,
                type: httpMethod,
                data: JSON.stringify(data),
                xhrFields: {
                    withCredentials: true
                }
            });
            ajax.then(function (result) {
                promise.resolve(result);
            });
            ajax.fail(function (jqXhr, textStatus) {
                var errorHtml = "<b>Url</b>: " + url + "<br/>";
                errorHtml += "<b>Method</b>: " + httpMethod + "<hr/>";
                errorHtml += "<b>Status</b>: " + jqXhr.status + " - " + jqXhr.statusText + "<br/>";
                errorHtml += "<b>Error</b>: " + jqXhr.responseText + "<br/>";
                errorHandler.Error(errorHtml);
                promise.reject(url, httpMethod, data, jqXhr, textStatus);
            });
            ajax.complete(function () {
                loadingProgress.LoadEnd();
            });
            return promise;
        };

    };

    //singleton
    return new instanca();

});