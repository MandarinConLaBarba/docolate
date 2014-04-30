var sinon = require('sinon'),
    _ = require('underscore'),
    should = require('should'),
    docolate = require('../../../lib/docolate'),
    Promise = require('bluebird'),
    adapterFactory = require('../../../lib/adapters/factory');

Promise.onPossiblyUnhandledRejection();

function getParamNames(fn) {
    var funStr = fn.toString();
    return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
}

describe("lib/docolate", function(){

    var stubs = {},
        expressAppArg,
        optionsArg,
        doc;

    beforeEach(function() {
        expressAppArg = {};
        optionsArg = {};
        stubs.createAdapter = sinon.stub(adapterFactory, "create");

        stubs.createAdapter.returns({});
    });

    afterEach(function() {
        _.invoke(stubs, "restore");
    });

    describe("exclude", function(){

        describe("when the exclusion is a string", function(){

            var result,
                exclusionArg;

            beforeEach(function() {

                exclusionArg = "/some/path/*";
                doc = docolate.create(expressAppArg, optionsArg);

                result = doc.exclude(exclusionArg);
            });

            it("return the doc reference", function(){

                result.should.equal(doc);

            });

            it("should have the exclusion in the options", function(){

                result.options.excludes.indexOf(exclusionArg)
                    .should.be.above(-1);

            });

        });

        describe("when the exclusion is a RegExp object", function(){

            var result,
                exclusionArg;

            beforeEach(function() {

                exclusionArg = /some regexp/;
                doc = docolate.create(expressAppArg, optionsArg);

                result = doc.exclude(exclusionArg);
            });

            it("return the doc reference", function(){

                result.should.equal(doc);

            });

            it("should have the exclusion in the options", function(){

                result.options.excludes.indexOf(exclusionArg)
                    .should.be.above(-1);

            });

        });

        describe("when the exclusion is an array", function(){

            var result,
                exclusionArg;

            beforeEach(function() {

                exclusionArg = ["exclude/*", "this/*"];
                doc = docolate.create(expressAppArg, optionsArg);

                result = doc.exclude(exclusionArg);
            });

            it("return the doc reference", function(){

                result.should.equal(doc);

            });

            it("should have the exclusion in the options", function(){

                exclusionArg.forEach(function(exclusion) {
                    result.options.excludes.indexOf(exclusion)
                        .should.be.above(-1);
                });

            });

        });


    });

    describe("include", function(){

        describe("when the inclusion is a string", function(){

            var result,
                inclusionArg;

            beforeEach(function() {

                inclusionArg = "/some/path/to/include*";
                doc = docolate.create(expressAppArg, optionsArg);

                result = doc.include(inclusionArg);
            });

            it("return the doc reference", function(){

                result.should.equal(doc);

            });

            it("should have the inclusion in the options", function(){

                result.options.includes.indexOf(inclusionArg)
                    .should.be.above(-1);

            });

        });

        describe("when the inclusion is a RegExp object", function(){

            var result,
                inclusionArg;

            beforeEach(function() {

                inclusionArg = /something to include/;
                doc = docolate.create(expressAppArg, optionsArg);

                result = doc.include(inclusionArg);
            });

            it("return the doc reference", function(){

                result.should.equal(doc);

            });

            it("should have the inclusion in the options", function(){

                result.options.includes.indexOf(inclusionArg)
                    .should.be.above(-1);

            });

        });

        describe("when the inclusion is an array", function(){

            var result,
                inclusionArg;

            beforeEach(function() {

                inclusionArg = ["include/*", "this/*"];
                doc = docolate.create(expressAppArg, optionsArg);

                result = doc.include(inclusionArg);
            });

            it("return the doc reference", function(){

                result.should.equal(doc);

            });

            it("should have the inclusion in the options", function(){

                inclusionArg.forEach(function(inclusion) {
                    result.options.includes.indexOf(inclusion)
                        .should.be.above(-1);
                });

            });

        });


    });

    describe("route", function(){

        var result,
            outputFormatArg,
            templateArg,
            req,
            res;

        beforeEach(function() {

            req = {};
            res = {
                send : sinon.stub()
            };

            doc = docolate.create(expressAppArg, optionsArg);
            stubs.render = sinon.stub(doc, "render");
            
        });
        
        describe("no matter what", function(){

            beforeEach(function() {
                result = doc.route();
            });
        
            it("should return a function", function(){
                
                result.should.be.a.Function;
            
            });
            
            describe("the returned function signature", function(){

                it("should have a req argument", function(){

                    getParamNames(result).indexOf("req").should.be.above(-1);

                });

                it("should have a res argument", function(){

                    getParamNames(result).indexOf("res").should.be.above(-1);

                });

            });
                
        });
        
        describe("when no args are passed", function(){

            describe("when the route callback is called", function(){

                describe("when the render fails", function(){

                    var failureReason = "someError",
                        failurePromise;

                    beforeEach(function() {

                        failurePromise = Promise.reject(failureReason);
                        doc.render.returns(failurePromise);
                        result = doc.route();

                        result(req, res);
                    });

                    beforeEach(function(done) {
                        failurePromise.lastly(done);
                    });

                    it("should pass default html template path to the render function", function(){
                        doc.render.lastCall.args[0]
                            .should.equal(doc.templates.html);

                    });

                    it("should send a response", function(){

                        res.send.called
                            .should.be.true;

                    });

                    it("should send a 400 response", function(){

                        res.send.calledWith(400)
                            .should.be.true;

                    });

                });

                describe("when the render succeeds", function(){

                    var compiledTemplate = "some rendered data",
                        fulfilledPromise;

                    beforeEach(function() {
                        fulfilledPromise = Promise.resolve(compiledTemplate);
                        doc.render.returns(fulfilledPromise);
                        result = doc.route();

                        result(req, res);
                    });

                    beforeEach(function(done) {
                        fulfilledPromise.lastly(done);
                    });

                    it("should send a response", function(){

                        res.send.called
                            .should.be.true;

                    });

                    it("should send the rendered template", function(){

                        res.send.calledWith(compiledTemplate)
                            .should.be.true;

                    });

                });

            });

        });

        describe("when the 'markdown' output format is passed", function(){

            describe("when the route callback is called", function(){

                describe("when the render succeeds", function(){

                    var compiledTemplate = "some rendered data",
                        fulfilledPromise;

                    beforeEach(function() {
                        fulfilledPromise = Promise.resolve(compiledTemplate);
                        doc.render.returns(fulfilledPromise);
                        result = doc.route('markdown');

                        result(req, res);
                    });

                    beforeEach(function(done) {
                        fulfilledPromise.lastly(done);
                    });


                    it("should send the rendered template", function(){

                        doc.render.calledWith(doc.templates.markdown)
                            .should.be.true;

                    });

                });

            });

        });

        describe("when the 'html' output format is passed", function(){

            describe("when the route callback is called", function(){

                describe("when the render succeeds", function(){

                    var compiledTemplate = "some rendered data",
                        fulfilledPromise;

                    beforeEach(function() {
                        fulfilledPromise = Promise.resolve(compiledTemplate);
                        doc.render.returns(fulfilledPromise);
                        result = doc.route('html');

                        result(req, res);
                    });

                    beforeEach(function(done) {
                        fulfilledPromise.lastly(done);
                    });


                    it("should send the rendered template", function(){

                        doc.render.calledWith(doc.templates.html)
                            .should.be.true;

                    });

                });

            });

        });

        describe("when the 'json' outputFormat is passed", function(){

            beforeEach(function() {

                outputFormatArg = 'json';

            });

            describe("when the route callback is called", function(){

                var docJson;

                beforeEach(function() {

                    docJson = {"some" : "json"};

                    stubs.docToJson = sinon.stub(doc, "toJSON");

                    doc.toJSON.returns(docJson);

                    result = doc.route(outputFormatArg);

                    result(req, res);
                });

                it("should send a response", function(){

                    res.send.called.should.be.true;

                });

                it("should not render anything", function(){

                    doc.render.called
                        .should.be.false;

                });

                it("should send the doc JSON", function(){

                    res.send.calledWith(docJson)
                        .should.be.true;

                });

            });

        });

    });
});