var Documentable = function (adapter) {
    this.adapter = adapter;
};

Documentable.prototype._addParam = function (param) {

    var lastRoute = this._lastRoute();
    if (!lastRoute.docParams) {
        lastRoute.docParams = [];
    }
    lastRoute.docParams.push(param);
};

Documentable.prototype.describePathParams = function (descriptionMap) {
    var self = this,
        lastRoute = this._lastRoute();

    descriptionMap = descriptionMap || {};

    lastRoute.keys.forEach(function (param) {
        var description = "none";
        if (descriptionMap[param.name]) {
            description = descriptionMap[param.name];
        }
        self.describeRequestParam(param.name, "string|number", description, param.optional);
    });

    return this;

};

Documentable.prototype.describeParam = function (name, type, description, optional) {
    this.describeRequestParam(name, type, description, optional);
    return this;
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

Documentable.prototype.describe = function (description) {
    this._lastRoute().description = description;
    return this;
};

Documentable.prototype._lastRoute = function () {
    return this.adapter.lastRoute();
};

module.exports = Documentable;