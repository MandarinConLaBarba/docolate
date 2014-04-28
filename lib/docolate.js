var Documentable = require('./documentable'),
    Promise = require('bluebird'),
    fs = require('fs'),
    merge = require('utils-merge'),
    ejs = require('ejs'),
    adapterFactory = require('./adapters/factory');

ejs.open = '{{';
ejs.close = '}}';

var Docolate = function(app) {
    this.adapter = adapterFactory.create(app);
    merge(app, new Documentable(this.adapter));
    this.app = app;
};

Docolate.prototype.documentation = function() {

    return this.adapter.extract();

};

Docolate.prototype.route = function(outputFormat, outputTemplate) {

    var docolate = this;

    function renderTemplate(req, res, tpl) {
        var readFile = Promise.promisify(fs.readFile);

        readFile(tpl)
            .then(function(template) {

                return ejs.render(template.toString(), {locals : {
                    routes : docolate.documentation()
                }});

            })
            .then(function(compiled) {
                res.send(compiled);
            }, function(err) {
                console.log(err);
                res.send(400, err);
            });
    }

    if (outputFormat === 'html') {

        outputTemplate = outputTemplate || __dirname + "/../templates/html.ejs";

        return function(req, res) {
            renderTemplate(req, res, outputTemplate);
        };

    } else if (outputFormat === 'json') {

        return function(req, res) {
            res.send(JSON.stringify(docolate.documentation()));
        };

    } else {//defaults to markdown

        outputTemplate = outputTemplate || __dirname + "/../templates/markdown.ejs";

        return function(req, res) {
            renderTemplate(req, res, __dirname + "/../templates/markdown.ejs");
        };


    }

};

module.exports = {
    create : function(app) {
        return new Docolate(app);
    }
};