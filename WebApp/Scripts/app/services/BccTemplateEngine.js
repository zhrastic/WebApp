define(['jquery', 'knockout'], function ($, ko) {


    //String template source
    ko.templateSources.stringTemplate = function (template, data) {
        this.templateHTML = template;
        this.data = data;
    }

    ko.utils.extend(ko.templateSources.stringTemplate.prototype, {
        data: function (key, value) {
            if (arguments.length === 1) {
                return this.data;
            }
            this.data = data;
        },
        text: function (value) {
            if (arguments.length === 0) {
                return this.templateHTML;
            }
            this.templateHTML = value;
        }
    });



    var BccTemplateEngine = function (koEngineType) {
        var engine = koEngineType ? new koEngineType() : new ko.nativeTemplateEngine();
        engine.templates = {};
        engine.makeTemplateSource = function (template, bindingContext, options) {
            // Named template
            if (typeof template == "string") {
                //debugger;

                var elem = null;
                if (template.indexOf('$') === 0) {
                    elem = $(template.substring(1))[0];
                }
                else if (template.indexOf('<') > -1) {
                    return new ko.templateSources.stringTemplate(template, bindingContext.$data);
                }
                else {
                    elem = document.getElementById(template);
                }
                return new ko.templateSources.domElement(elem);

            }
            else if ((template.nodeType == 1) || (template.nodeType == 8)) {
                // Anonymous template
                return new ko.templateSources.anonymousTemplate(template);
            }

        };

        engine.renderTemplate = function (template, bindingContext, options) {
            var templateSource = engine.makeTemplateSource(template, bindingContext, options);
            return engine.renderTemplateSource(templateSource, bindingContext, options);
        };

        return engine;
    };


    ko.BccTemplateEngine = BccTemplateEngine;


    console.log(ko.templateSources)


    //Postavi naš engine u knockout 
    if (jQuery.tmpl && jQuery.tmpl.tag.tmpl.open.toString().indexOf('__') >= 0) {
        ko.setTemplateEngine(new BccTemplateEngine(ko.jqueryTmplTemplateEngine));
    }
    else {
        ko.setTemplateEngine(new BccTemplateEngine());
    }

    return BccTemplateEngine;

});