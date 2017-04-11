module.exports = function(grunt) {
    grunt.initConfig({
        "closure-compiler": {
            tsp: {
                closurePath: "/usr/local/opt/closure-compiler/libexec/",
                js: ["client/lib/*.js", "client/src/tsp/app.js"],
                jsOutputFile: "client/dist/tsp.min.js",
                maxBuffer: 500,
                options: {
                    compilation_level: "ADVANCED_OPTIMIZATIONS",
                    language_in: "ECMASCRIPT6",
                    language_out: "ECMASCRIPT5_STRICT",
                    module_resolution: 'BROWSER',
                    output_wrapper: "(function() {%output%}).call(window);"
                }
            }
        },
        watch: {
            "closure-compiler": {
                files: "client/src/tsp/app.js",
                tasks: ["closure-compiler"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-closure-compiler");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("default", ["closure-compiler", "watch"]);

};