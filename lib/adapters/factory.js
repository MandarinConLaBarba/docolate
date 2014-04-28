var Express3Extractor = require(__dirname + '/express3x'),
    Express4Extractor = require(__dirname + '/express4x');

module.exports = {
    create : function(app) {

        if (app.lazyrouter) {
            app.lazyrouter();
            return new Express4Extractor(app);
        } else if (app.routes) {
            return new Express3Extractor(app);
        }

        throw new Error("Can't locate route data. This version of express isn't supported.");

    }
};