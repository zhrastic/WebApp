define(function (require) {
    var ko = require('knockout');
    var lng = window.navigator.userLanguage || window.navigator.language;
    
    return ko.observable(lng);
});