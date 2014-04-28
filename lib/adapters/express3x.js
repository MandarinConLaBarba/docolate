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
            var path = args[0];

            var docObj = {
                path : path,
                methods : [method],
                keys : []
            };

            pathToRegexp(path, docObj.keys);

            adapter.docRoutes.push(docObj);

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
    return _.map(this.docRoutes, function(docRoute) {
        docRoute.params = docRoute.docParams;
        return docRoute;
    });
};

Express3Adapter.prototype.lastRoute = function() {
    var len = this.docRoutes.length;
    return this.docRoutes[len - 1];
};


module.exports = Express3Adapter;