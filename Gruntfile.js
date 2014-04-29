var Promise = require('bluebird'),
    _ = require('underscore');

module.exports = function(grunt) {

    var config = {
        mochaTest: {
            unit: {
                options: {
                    reporter: 'spec'
                },
                src: ['tests/unit/**/*.js']
            }
        },
        jshint: {
            options : {
                '-W030': false
            },
            all: [
                'Gruntfile.js',
                'examples/*.js',
                'lib/**/*.js']
        }
    };
    grunt.initConfig(config);

    //Load plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('tests', 'Runs the unit tests and exits', ['mochaTest:unit']);
    grunt.registerTask('test', 'Runs the unit tests and exits', ['tests']);

    grunt.registerTask('default', 'Build the app and run jshint', ['jshint:all']);

    grunt.registerTask('examples', 'Regenerate the examples', function() {

        var done = this.async();

        require(__dirname + "/examples/app.simpleCase.js").run()
            .lastly(done);
    });

};
