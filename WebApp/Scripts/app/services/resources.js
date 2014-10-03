define(function(require) {

    var ko = require('knockout');
    var locale = require('services/locale');
    var resJson = {};


    //========================================== DICTIONARY ==========================================

    //=== A ===
    
    //=== B ===
    
    //=== C ===
    resJson["Close"] = {
        hr: "Zatvori",
        en: "Close"
    };
    //=== D ===
    
    //=== E ===
    resJson["ErrorDialogTitle"] = {
        hr: "Greška",
        en: "Error"
    };
    //=== F ===

    //=== G ===

    //=== H ===

    //=== I ===

    //=== L ===
    
    //=== M ===
    
    //=== N ===
    resJson["No"] = {
        hr: "Ne",
        en: "No"
    };
    //=== O ===
    resJson["OK"] = {
        hr: "U redu",
        en: "OK"
    };
    
    //=== P ===
    
    //=== R ===
    
    //=== S ===
    
    //=== T ===
    
    //=== U ===
    
    //=== W ===
    
    //=== Y ===
    resJson["Yes"] = {
        hr: "Da",
        en: "Yes"
    };
//==============================================================================


    function insteadOfLanguage(language) {
        switch (language) {
            case "hr-HR":
                return "hr";
            case "en-GB":
            case "en-US":
                return "en";
            default:
                return "hr";
        }
    }

    return function(resourceText) {
        return ko.computed(function () {
            var currLanguage = locale();
            if (resJson.hasOwnProperty(resourceText)) {
                var rezObj = resJson[resourceText];
                if (rezObj.hasOwnProperty(currLanguage)) {
                    return rezObj[currLanguage];
                } else {
                    var languageInstead = insteadOfLanguage(currLanguage);
                    if (rezObj.hasOwnProperty(languageInstead)) {
                        return rezObj[languageInstead];
                    }
                    return "NE POSTOJI PRIJEVOD ZA TRENUTNI JEZIK: " + currLanguage;
                }
            }
            return "NE POSTOJI PRIJEVOD";
        });
    };

});