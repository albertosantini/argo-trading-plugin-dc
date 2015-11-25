"use strict";

module.exports = function (grunt) {
    grunt.initConfig({
        eslint: {
            src: [
                "Gruntfile.js",
                "bin/argo-trading-plugin-dc",
                "lib/**/*.js"
            ]
        }
    });

    grunt.loadNpmTasks("grunt-eslint");

    grunt.registerTask("default", [
        "eslint"
    ]);
};
