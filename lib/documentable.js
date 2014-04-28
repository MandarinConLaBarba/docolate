var documentable = {
    _addParam : function(param) {

        var lastRoute = this._lastRoute();
        if (!lastRoute.docParams) {
            lastRoute.docParams = [];
        }
        lastRoute.docParams.push(param);
    },
    describePathParams : function(descriptionMap) {
        var self = this,
            lastRoute = this._lastRoute();

        descriptionMap = descriptionMap || {};

        lastRoute.keys.forEach(function(param) {
            var description = "none";
            if (descriptionMap[param.name]) {
                description = descriptionMap[param.name];
            }
            self.describeRequestParam(param.name, "string|number", description, param.optional);
        });

        return this;

    },
    describeParam : function(name, type, description, optional) {
        this.describeRequestParam(name, type, description, optional);
        return this;
    },
    describeRequestParam : function(name, type, description, optional) {
        this._addParam({
            body : false,
            name : name,
            type : type,
            optional : optional || false,
            description : description
        });
        return this;
    },
    describeBodyParam : function(name, type, description, optional) {
        this._addParam({
            body : true,
            name : name,
            type : type,
            optional : optional || false,
            description : description
        });
        return this;
    },
    describe : function(description) {
        this._lastRoute().description = description;
        return this;
    },
    _lastRoute : function() {
        //this needs to always return the last route, regardless of express version (3/4)
        var len = this._router.stack.length;
        return this._router.stack[len - 1];
    }
};

module.exports = documentable;