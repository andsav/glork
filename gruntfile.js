module.exports = function (grunt) {
  const global = [
    'client/lib/constants.js',
    'client/lib/$.js',
    'client/lib/helpers.js',
    'client/lib/canvas.js',
    'client/lib/editor.js',
    'client/lib/socket.js'
  ]

  let config = (files) => {
    return {
      closurePath: '/opt/closure',
      js: global.concat(files),
      jsOutputFile: 'client/dist/tsp.min.js',
      maxBuffer: 500,
      options: {
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        language_in: 'ECMASCRIPT6',
        language_out: 'ECMASCRIPT5_STRICT',
        module_resolution: 'BROWSER',
        output_wrapper: '(function() {%output%}).call(window);',
        externs: 'client/build/externs.js'
      }
    }
  }

  grunt.initConfig({
    'closure-compiler': {
      tsp: config([
        'client/src/tsp/config.js',
        'client/src/tsp/Path.js',
        'client/src/tsp/ConfigCanvas.js',
        'client/src/tsp/ResultCanvas.js',
        'client/src/tsp/TSPCanvas.js',
        'client/src/tsp/app.js'
      ]),
      clustering: config([
        'client/src/clustering/config.js',
        'client/src/clustering/ConfigSlider.js',
        'client/src/clustering/CursorSlider.js',
        'client/src/clustering/MainCanvas.js',
        'client/src/clustering/app.js'
      ]),
      notes: config([
        'client/src/notes/display.js',
        'client/src/notes/forms.js',
        'client/src/notes/views.js',
        'client/src/notes/router.js',
        'client/src/notes/app.js'
      ])
    },
    watch: {
      tsp: {
        files: 'client/src/tsp/*.js',
        tasks: ['closure-compiler:tsp']
      },
      clustering: {
        files: 'client/src/clustering/*.js',
        tasks: ['closure-compiler:clustering']
      },
      notes: {
        files: 'client/src/notes/*.js',
        tasks: ['closure-compiler:notes']
      }
    }
  })
  grunt.loadNpmTasks('grunt-closure-compiler')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.registerTask('default', ['closure-compiler', 'watch'])
}