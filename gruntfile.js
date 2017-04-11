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
            },
            kmeans: {
                closurePath: "/usr/local/opt/closure-compiler/libexec/",
                js: ["client/lib/*.js", "client/src/k-means/app.js"],
                jsOutputFile: "client/dist/k-means.min.js",
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
            tsp: {
                files: "client/src/tsp/app.js",
                tasks: ["closure-compiler:tsp"]
            },
            kmeans: {
                files: "client/src/k-means/app.js",
                tasks: ["closure-compiler:kmeans"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-closure-compiler");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("default", ["closure-compiler", "watch"]);

};