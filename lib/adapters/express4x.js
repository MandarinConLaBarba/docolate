var allMethods = require('methods'),
    _ = require('underscore');

var Express4xAdapter = function(app) {
    this.app = app;
};

Express4xAdapter.prototype.extract = function() {
    var docs = [];

    var expressRouter = this.app._router;

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
            parsedParams : stackItem.keys,
            docParams : stackItem.docParams
        };

        if (stackItem.description) {
            docObject.description = stackItem.description;
        }

        docs.push(docObject);
    });

    return docs;

};

Express4xAdapter.prototype.lastRoute = function() {
    var len = this.app._router.stack.length;
    return this.app._router.stack[len - 1];
};

module.exports = Express4xAdapter;