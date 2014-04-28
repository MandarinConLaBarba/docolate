var documentable = require('./documentable'),
    Promise = require('bluebird'),
    fs = require('fs'),
    merge = require('utils-merge'),
    ejs = require('ejs'),
    allMethods = require('methods'),
    _ = require('underscore');

ejs.open = '{{';
ejs.close = '}}';

var Docolate = function(app) {
    merge(app, documentable);
    this.app = app;
};

Docolate.prototype.documentation = function() {

    var self = this,
        docs = [];

    //TODO: support express 3.x

    var expressRouter = this.app._router;

    if (!expressRouter || !expressRouter.stack) {
        throw new Error("Can't locate route data. This version of express isn't supported.");
    }

    //this only works for express 4.x
    expressRouter.stack.forEach(function(stackItem) {
        if (!stackItem.route) {
            return;
        }

        var methods = [];

        if (stackItem.route.methods && _.keys(stackItem.route.methods).length === allMethods.length) {
            methods.push('all');
        } else {
            _.each(stackItem.route.methods, function(val, method) {
                if (val) {
                    methods.push(method);
                }
            });
        }

        var docObject = {
            path : stackItem.route.path,
            methods : methods,
            params : stackItem.docParams
        };

        if (stackItem.description) {
            docObject.description = stackItem.description;
        }

        docs.push(docObject);
    });

    return docs;

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