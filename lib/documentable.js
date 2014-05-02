var _ = require('underscore');

var Documentable = function (adapter) {
    this.adapter = adapter;
};

Documentable.prototype._addParam = function (param) {

    var lastRoute = this.adapter.lastRoute();
    if (!lastRoute.docParams) {
        lastRoute.docParams = [];
    }
    lastRoute.docParams.push(param);
};


Documentable.prototype.describeRequestParam = function (name, type, description, optional) {
    this._addParam({
        body: false,
        name: name,
        type: type,
        optional: optional || false,
        description: description
    });
    return this;
};

Documentable.prototype.describeBodyParam = function (name, type, description, optional) {
    this._addParam({
        body: true,
        name: name,
        type: type,
        optional: optional || false,
        description: description
    });
    return this;
};
Documentable.prototype.describeReturnParam = function (name, description) {

    this._addParam({
        returns: true,
        name: name,
        description: description
    });
    return this;
};

Documentable.prototype.describe = function (parm) {

    var self = this;

    if (_.isString(parm)) {
        this.adapter.lastRoute().description = parm;
    } else if (_.isObject(parm)) {
        if (parm.description) {
            this.adapter.lastRoute().description = parm.description;
        }
        if (parm.params) {
            if (!_.isObject(parm.params)) {
                throw new Error("Invalid parameter: describe() expects params property to be an object.");
            }
            _.each(parm.params, function(description, key) {

                //TODO: check if object
                self.describeRequestParam(key, null, description);
            });

        }
        if (parm.body) {
            if (!_.isObject(parm.body)) {
                throw new Error("Invalid parameter: describe() expects body property to be an object.");
            }

            _.each(parm.body, function(description, key) {
                //TODO: check if object
                self.describeBodyParam(key, null, description);
            });

        }

        if (parm.returns) {

            if (_.isString(parm.returns)) {
                self.describeReturnParam(parm.returns);
            } else if (_.isObject(parm.returns)) {
                self.describeReturnParam(parm.returns.name, parm.returns.description);
            } else {
                throw new Error("Invalid parameter: describe() expects returns property to be an object or string.");
            }

        }

    } else {
        throw new Error("Invalid parameter: describe() expects a string or an object.");
    }

    return this;
};


module.exports = Documentable;