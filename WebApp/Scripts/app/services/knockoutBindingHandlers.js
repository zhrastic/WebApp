define(function (require) {

    var ko = require('knockout');
    var locale = require('services/locale');
    var bootstapDate = require('bootstrapDataPicker');
    var bootDateHr = require('bootstrapDataPicker-hr');
    var helper = require('services/helper');
    var moment = require('moment');

    /*
    =========================================================================================
        HANDLERS
    =========================================================================================
    */


    ko.bindingHandlers.fadeVisible = {
        init: function (element, valueAccessor) {
            // Initially set the element to be instantly visible/hidden depending on the value
            var value = valueAccessor();
            //$(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
        },
        update: function (element, valueAccessor) {
            // Whenever the value subsequently changes, slowly fade the element in or out
            var value = valueAccessor();
            //ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
            $(element).toggle("fast");
        }
    };

    ko.bindingHandlers.placeholder = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var underlyingObservable = valueAccessor();
            ko.applyBindingsToNode(element, { attr: { placeholder: underlyingObservable } });
        }
    };

    ko.bindingHandlers.hasFocus = {
        init: function (element, valueAccessor) {
            $(element).focus(function () {
                var value = valueAccessor();
                value(true);
            });
            $(element).blur(function () {
                var value = valueAccessor();
                value(false);
            });
        },
        update: function (element, valueAccessor) {
            var value = valueAccessor();
            if (ko.unwrap(value))
                element.focus();
            else
                element.blur();
        }
    };

    //Binding koji se koristi za checkbox.
    //Property na koji se binda treba biti observable array.
    //Kao dodatni parametar u binding se postavlja entity.
    //
    //1. Smjer model-> kontrola
    //      Ako se entitet nalazi u arrayu checkbox će biti true, inače false.
    //
    //2. Smjer kontrola model 
    //  Ako se checkbox označi, entitet će se staviti u array, 
    //  a ako se heckbox isključi entitet se miče iz array-a
    //
    ko.bindingHandlers.checkEntityInArray = {
        init: function (element, valueAccessor, allBindingsAccessor) {

            var arr = valueAccessor();
            var entity = allBindingsAccessor().entity;

            $(element).click(function (event) {
                event.stopPropagation();
                if (this.checked) {
                    if (arr.indexOf(entity) == -1) arr.push(entity);
                }
                else {
                    arr.remove(entity);
                }
            });


            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).off();//Kod uništenja bindinga makni pretplatu na click
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            var arr = ko.unwrap(valueAccessor());
            var entity = allBindingsAccessor().entity;
            var val = arr.indexOf(entity) > -1;
            
            element.checked = val;
            
        }
    };


    ko.bindingHandlers.bootstrapDatumPicker = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

            var dataPicker = $(element);
            dataPicker.datepicker({ autoclose: true, language: locale(), format: helper.getDateFormat(locale()), todayBtn: true, todayHighlight: true });


            dataPicker.on("changeDate", function (e) {
                dataPicker.attr('isWriting', 'true');
                var observable = valueAccessor();//Dohvati observable
                observable(dataPicker.datepicker('getDate'));
                dataPicker.removeAttr('isWriting');
            });

            dataPicker.on("clearDate", function (e) {
                dataPicker.attr('isWriting', 'true');
                var observable = valueAccessor();//Dohvati observable
                observable(null);
                dataPicker.removeAttr('isWriting');
            });

            ko.computed(function () {
                dataPicker.datepicker("setOptions", { language: locale(), format: helper.getDateFormat(locale()) });
            });


            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                dataPicker.datepicker("remove");
            });
        },
        update: function (element, valueAccessor, allBindings) {
            var val = ko.utils.unwrapObservable(valueAccessor());
            var ostaliBindinzi = ko.utils.unwrapObservable(allBindings());
            var widget = $(element);
            if (widget.attr('isWriting')) return;

            if (widget) {
                widget.datepicker('update', val);
            }
        }
    };


    ko.bindingHandlers.qToolTip = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            
            var val = ko.utils.unwrapObservable(valueAccessor()); //valueAccessor -> config za qTip

            var args = ko.utils.unwrapObservable(allBindings()); //valueAccessor -> config za qTip

            var defaults = {
                content: 'Peor',
                show: 'mouseenter',
                hide: 'mouseleave',
                style: 'qtip-bootstrap',
                position: {
                    my: 'left bottom',
                    at: 'right centre'
                }
            };

            var configObject = $.extend({}, defaults, val);

            if (args && args.qTipArg && $.isFunction(configObject.content)) {
                configObject.content = function (event, coords) {
                    return val.content(event, coords, args.qTipArg);
                };
            }


            $(element).qtip(configObject);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).qtip("destroy", true);
            });

        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var observable = valueAccessor();//Dohvati observable
        }
    };

    ko.bindingHandlers.doubleClick = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var handler = valueAccessor(),
                delay = 500,
                clickTimeout = false;

            $(element).click(function () {
                if (clickTimeout !== false) {
                    handler(bindingContext);
                    clickTimeout = false;
                } else {
                    clickTimeout = setTimeout(function () {
                        clickTimeout = false;
                    }, delay);
                }
            });
        }
    };

    /*
    =========================================================================================
        EXTENDERS
    =========================================================================================
    */


    ko.extenders.requiredField = function (target, overrideMessage) {
        //add some sub-observables to our observable
        target.hasError = ko.observable();
        target.validationMessage = ko.observable();

        //define a function to do validation
        function validate(newValue) {
            target.hasError(newValue ? false : true);
            target.validationMessage(newValue ? "" : overrideMessage || "This field is required");
        }

        //initial validation
        validate(target());

        //validate whenever the value changes
        target.subscribe(validate);

        //return the original observable
        return target;
    };

    ko.extenders.integerField = function (target, overrideMessage) {
        //add some sub-observables to our observable
        target.hasError = ko.observable();
        target.validationMessage = ko.observable();

        //define a function to do validation
        function validate(newValue) {
            
            if (newValue && !helper.isInteger(newValue)) {
                target.hasError(true);
                target.validationMessage(overrideMessage || "This field must be integer");
            } else {
                target.hasError(false);
            }
        }

        //initial validation
        validate(target());

        //validate whenever the value changes
        target.subscribe(validate);

        //return the original observable
        return target;
    };

});