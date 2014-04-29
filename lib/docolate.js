var Documentable = require('./documentable'),
    _ = require('underscore'),
    Promise = require('bluebird'),
    fs = require('fs'),
    merge = require('utils-merge'),
    ejs = require('ejs'),
    minimatch = require('minimatch'),
    adapterFactory = require('./adapters/factory');

var Docolate = function(app, options) {

    options = options || {};

    this.options = _.defaults(options, {
        autoParams : true,
        excludes : [],
        includes : []
    });

    this.adapter = adapterFactory.create(app);
    merge(app, new Documentable(this.adapter));
    this.app = app;
};

Docolate.prototype.exclude = function(stringOrArray) {
    if (_.isArray(stringOrArray)) {
        this.options.excludes = this.options.excludes.concat(stringOrArray);
    } else {
        this.options.excludes.push(stringOrArray);
    }
    return this;
};

Docolate.prototype.include = function(stringOrArray) {
    if (_.isArray(stringOrArray)) {
        this.options.includes = this.options.includes.concat(stringOrArray);
    } else {
        this.options.includes.push(stringOrArray);
    }
    return this;
};

Docolate.prototype.documentation = function() {

    if (this.compiledDocs) {
        return Promise.cast(this.compiledDocs);
    }

    var options = this.options,
        unfiltered = this.adapter.extract();

    var filtered =
        _.chain(unfiltered).map(function (routeDocObj) {
            if (!options.autoParams) {
                delete routeDocObj.parsedParams;
            }
            return routeDocObj;
        }).filter(function (routeDocObj) {
                //if no excludes, just return
                if (!options.excludes || !options.excludes.length) {
                    return true;
                }
                return !_.any(options.excludes, function (expression) {
                    if (expression instanceof RegExp) {
                        return routeDocObj.path.match(expression) !== null;
                    }
                    return minimatch(routeDocObj.path, expression);

                });

                //check for matches in path w/ exclude, and remove
            }).filter(function (routeDocObj) {
                //if no includes, just return
                if (!options.includes || !options.includes.length) {
                    return true;
                }
                return !_.any(options.includes, function (expression) {
                    if (expression instanceof RegExp) {
                        return routeDocObj.path.match(expression) === null;
                    }
                    return minimatch(routeDocObj.path, expression);
                });

            }).map(function(routeDocObj) {

                routeDocObj.docParams = routeDocObj.docParams || [];
                routeDocObj.parsedParams = routeDocObj.parsedParams || [];

                var uniqueParsedParams = _.chain(routeDocObj.parsedParams).filter(function(parseParam) {
                    return !_.any(routeDocObj.docParams, function(docParam) {
                        return parseParam.name === docParam.name;
                    });
                }).map(function(uniqueParsedParam) {
                        //uniqueParsedParam.type = 'unknown';
                        uniqueParsedParam.body = false;
                        return uniqueParsedParam;
                    }).value();

                routeDocObj.params = routeDocObj.docParams.concat(uniqueParsedParams);
                delete routeDocObj.parsedParams;
                delete routeDocObj.docParams;

                return routeDocObj;

            }).value();

    this.compiledDocs = filtered;

    return Promise.cast(filtered);
};

Docolate.prototype.templates = {
    "html" : __dirname + "/../templates/html.ejs",
    "mardkown" : __dirname + "/../templates/markdown.ejs"
};

Docolate.prototype.render = function(templatePath) {

    templatePath = templatePath || __dirname + "/../templates/markdown.ejs";
    var docolate = this;

    var readFile = Promise.promisify(fs.readFile);

    return Promise.all([readFile(templatePath), docolate.documentation()])
        .then(function(results) {

            return ejs.render(results[0].toString(), {locals : {
                routes : results[1]
            }});

        });
};

Docolate.prototype.toJSON = function() {
    return JSON.stringify(this.documentation());
};

Docolate.prototype.toJson = Docolate.prototype.toJSON;

Docolate.prototype.route = function(outputFormat, outputTemplate) {

    var docolate = this;

    function renderAndRespond(req, res, tplPath) {

        docolate.render(tplPath)
            .then(function(compiled) {
                res.send(compiled);
            }, function(err) {
                res.send(400, err);
            });
    }

    if (outputFormat === 'html') {

        outputTemplate = outputTemplate || __dirname + "/../templates/html.ejs";

        return function(req, res) {
            renderAndRespond(req, res, outputTemplate);
        };

    } else if (outputFormat === 'json') {

        return function(req, res) {
            res.send(docolate.toJSON());
        };

    } else {//defaults to markdown

        return function(req, res) {
            renderAndRespond(req, res, outputTemplate);
        };


    }

};

module.exports = {
    create : function(app, options) {
        return new Docolate(app, options);
    }
};