module.exports = function(grunt) {
    grunt.initConfig({
        "closure-compiler": {
            tsp: {
                closurePath: "/opt/closure",
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
            },
            clustering: {
                closurePath: "/opt/closure",
                js: ["client/lib/*.js", "client/src/clustering/app.js"],
                jsOutputFile: "client/dist/clustering.min.js",
                maxBuffer: 500,
                options: {
                    compilation_level: "ADVANCED_OPTIMIZATIONS",
                    language_in: "ECMASCRIPT6",
                    language_out: "ECMASCRIPT5_STRICT",
                    module_resolution: 'BROWSER',
                    output_wrapper: "(function() {%output%}).call(window);",
                }
            },
            notes: {
                closurePath: "/opt/closure",
                js: ["client/lib/*.js", "client/src/notes/app.js"],
                jsOutputFile: "client/dist/notes.min.js",
                maxBuffer: 500,
                options: {
                    compilation_level: "ADVANCED_OPTIMIZATIONS",
                    language_in: "ECMASCRIPT6",
                    language_out: "ECMASCRIPT5_STRICT",
                    module_resolution: 'BROWSER',
                    output_wrapper: "(function() {%output%}).call(window);",
                }
            }
        },
        watch: {
            tsp: {
                files: "client/src/tsp/app.js",
                tasks: ["closure-compiler:tsp"]
            },
            clustering: {
                files: "client/src/clustering/app.js",
                tasks: ["closure-compiler:clustering"]
            },
            notes: {
                files: "client/src/notes/app.js",
                tasks: ["closure-compiler:notes"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-closure-compiler");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("default", ["closure-compiler", "watch"]);

};