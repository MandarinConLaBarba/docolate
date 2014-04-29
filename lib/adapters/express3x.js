var allMethods = require('methods'),
    pathToRegexp = require('path-to-regexp'),
    _ = require('underscore');


var Express3Adapter = function(app) {
    this.app = app;
    this.initializeRouteTracking();
    this.docRoutes = [];
};

Express3Adapter.prototype.initializeRouteTracking = function() {

    var adapter = this,
        app = this.app;

    function createWrapper(realHandler, method) {
        return function() {
            var args = Array.prototype.slice.call(arguments, 0);
            if (args.length > 1) {
                var path = args[0];

                var docRouteObj = {
                    path : path,
                    methods : [method],
                    parsedParams : []
                };

                pathToRegexp(path, docRouteObj.parsedParams);

                adapter.docRoutes.push(docRouteObj);
            }

            return realHandler.apply(app, args);
        };
    }

    var realAllHandler = app.all,
        allWrapperFunc = createWrapper(realAllHandler, 'all');

    app.all = allWrapperFunc;

    allMethods.forEach(function(method){

        var realHandler = app[method],
            wrapperFunc = createWrapper(realHandler, method);

        app[method] = wrapperFunc;


    });

};



Express3Adapter.prototype.extract = function() {

    return this.docRoutes;

};

Express3Adapter.prototype.lastRoute = function() {
    var len = this.docRoutes.length;
    return this.docRoutes[len - 1];
};


module.exports = Express3Adapter;