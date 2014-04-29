var express = require('express');
var app = express(),
    docolate = require('../'),
    fs = require('fs'),
    Promise = require('bluebird'),
    util = require('util');



module.exports = {
    run : function() {
        var doc = docolate.create(app);

        app.post("/items", function(reg, res) {})
            .describe("Add an item");

        app.post("/users", function(reg, res) {})
            .describe({
                description : "Add a user",
                body : {
                    "User" : "A User object"
                }
            });

        app.get("/items", function(req, res) {})
            .describe("Fetch a list of items");

        app.get("/items/:itemId", function(reg, res) {})
            .describe("Fetch a single item");


        var writeFile = Promise.promisify(fs.writeFile);

        return doc.render(doc.templates.html).then(function(html) {
            return writeFile(__dirname + "/app.simpleCase.html", html);
        }).then(function() {
                console.log("Example generated");
            }, function(reason) {
                console.error("Failed to generate doc: " + reason);
            });
    }
};

