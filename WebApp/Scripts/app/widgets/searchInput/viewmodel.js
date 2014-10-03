

define(['durandal/app', 'knockout', 'jquery', 'services/locale', 'services/resources','qTip2'], function (app, ko, $, locale, resource, qTip) {

    //=======================================================================//		

    var noop = function(){};

    //
    //DefaultValues
    //
    var defaults = {
        selectedActionId: ko.observable('Jednako'),
        actions: [
            { Id: "Sadrzi", value: resource('Contains') },
            { Id: "Jednako", value: resource('Equally') },
            { Id: "Razlicito", value: resource('Differently') },
            { Id: "VeceOd", value: resource('GreaterThan') },
            { Id: "ManjeOd", value: resource('LessThan') },
            { Id: "PocinjeSa", value: resource('BeginWith') },
            { Id: "ZavrsavaSa", value: resource('EndsWith') }
        ],
        selectOptions: [
            { Id: -1, optionText: "" }
        ],
        inputValue: "",
        inputObject: null,
        inputValue2: "",
        inputObject2: null,
        eraseText: resource('Erase'),
        inputFieldType: 'text',
        qTipValidationConfig: {
            content: "Validation error",
            show: 'mouseenter',
            hide: 'mouseleave',
            position: {
                my: 'right bottom',
                at: 'right top'
            }
        },
        validationCallback: noop,
        hasError: false,
        readOnly: false,
        between: false
};


    var widget = function(config) {
        var self = this;

        self.setAction = function(data) {
            self.selectedActionId(data.Id);
        };

        self.inputFieldType = ko.isObservable(config.inputFieldType)
			? config.inputFieldType
			: ko.observable(config.inputFieldType !== undefined ? config.inputFieldType : defaults.inputFieldType);

        self.selectOptions = ko.isObservable(config.selectOptions)
			? config.selectOptions
			: ko.observable(config.selectOptions !== undefined ? config.selectOptions : defaults.selectOptions);

        self.actions = ko.isObservable(config.actions)
			? config.actions
			: ko.observable(config.actions !== undefined ? config.actions : defaults.actions);
        
        self.selectedActionId = ko.isObservable(config.selectedActionId)
           ? config.selectedActionId
           : ko.observable(config.selectedActionId !== undefined ? config.selectedActionId : defaults.selectedActionId);
        

        self.between = ko.isObservable(config.between)
			? config.between
			: ko.observable(config.between !== undefined ? config.between : defaults.between);


        self.selectedAction = ko.computed(function() {
            if (self.selectedActionId()) {
                for (var i = 0; i < self.actions().length; i++) {
                    var item = self.actions()[i];
                    if (item.Id === self.selectedActionId()) {
                        return item;
                    }
                }
            }
            return null;
        });
        self.inputValue = ko.isObservable(config.inputValue)
           ? config.inputValue
           : ko.observable(config.inputValue !== undefined ? config.inputValue : defaults.inputValue);
      
        self.inputObject = ko.isObservable(config.inputObject)
           ? config.inputObject
           : ko.observable(config.inputObject !== undefined ? config.inputObject : defaults.inputObject);

        self.inputValue2 = ko.isObservable(config.inputValue2)
          ? config.inputValue2
          : ko.observable(config.inputValue2 !== undefined ? config.inputValue2 : defaults.inputValue2);

        self.inputObject2 = ko.isObservable(config.inputObject2)
           ? config.inputObject2
           : ko.observable(config.inputObject2 !== undefined ? config.inputObject2 : defaults.inputObject2);

        self.readOnly = ko.isObservable(config.readOnly)
           ? config.readOnly
           : ko.observable(config.readOnly !== undefined ? config.readOnly : defaults.readOnly);

        self.getreadonlyState = ko.computed(function () {
            if (self.readOnly()) {
                return "readonly";
            }
            return undefined; //onda knockout ne binda....
        });


        //Validation 
        self.qTipValidationConfig = ko.isObservable(config.qTipValidationConfig)
          ? config.qTipValidationConfig
          : ko.observable(config.qTipValidationConfig !== undefined ? config.qTipValidationConfig : defaults.qTipValidationConfig);

        self.validationCallback = config.validationCallback ? config.validationCallback : defaults.validationCallback;
        self.hasError = ko.isObservable(config.hasError)
          ? config.hasError
          : ko.observable(config.hasError !== undefined ? config.hasError : defaults.hasError);
        
        //Za napraviti validaciju iz vana -> rezultat validacije ide u hasError observable.... pa na temelju toga prijkazuje ikonu upozorenja
        //To je tako napravljeno jer iz vana trebam znati da li je widget ispravan kako bi mogao na temelju toga odlučivati (npr stopirati pretragu)
        self.validation = ko.computed(function () {
            if (self.inputObject()) {
                self.validationCallback(self.inputObject());
            } else {
                self.validationCallback(self.inputValue());
            }
        });

        self.eraseText = defaults.eraseText;
        self.clearContent = function() {
            self.inputValue("");
            if (self.inputFieldType() == 'select') {
                self.inputObject(self.selectOptions()[0]);
            } else {
                self.inputObject(null);
            }
            
        };
        
       
    };
    
    return function returnWidget() {
        var self = this;

        self.activate = function (config) {
            $.extend(self, new widget(config));
        };
    };

});