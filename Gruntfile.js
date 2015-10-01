module.exports = function(grunt){

  grunt.initConfig({
    uglify: {
      options: {
        banner: '/*\n evid\n Copyright (C) 2015 Christoph Kappestein\n License: MIT\n*/\n',
        mangle: false
      },
      dist: {
        files: {
          './build/evid-app.min.js': [
            './app/components/definition.js',
            './app/components/registry.js',
            './app/components/schema.js',
            './app/api.js',
            './app/page.js',
            './app/app.js'
          ]
        }
      }
    },
    concat: {
      dist_js: {
        options: {
          separator: ';\n',
          process: function(src, filepath) {
            return '// Source: ' + filepath + '\n' +
              src.replace(/\/\/# sourceMappingURL=([A-z0-9\-\.\_]+)/g, '').trim();
          },
        },
        src: [
          './app/bower_components/highlightjs/highlight.pack.min.js',
          './app/bower_components/angular/angular.min.js',
          './app/bower_components/angular-animate/angular-animate.min.js',
          './app/bower_components/angular-aria/angular-aria.min.js',
          './app/bower_components/angular-loader/angular-loader.min.js',
          './app/bower_components/angular-material/angular-material.min.js',
          './app/bower_components/angular-route/angular-route.min.js',
          './app/bower_components/angular-sanitize/angular-sanitize.min.js',
          './app/bower_components/angular-highlightjs/angular-highlightjs.min.js',
          './build/evid-app.min.js',
          './build/evid-templates.min.js'
        ],
        dest: './build/evid.min.js'
      },
      dist_css: {
        options: {
          separator: '\n',
          process: function(src, filepath) {
            return '/* Source: ' + filepath + '*/\n' +
              src.trim();
          },
        },
        src: [
          './app/bower_components/angular-material/angular-material.css',
          './app/bower_components/highlightjs/styles/github.css',
          './app/app.css'
        ],
        dest: './build/evid.min.css'
      }
    },
    cssmin: {
      compress_css: {
        src: './build/evid.min.css',
        dest: './build/evid.min.css'
      }
    },
    ngtemplates: {
      evid: {
        cwd: 'app',
        src: 'partials/*.html',
        dest: './build/evid-templates.min.js',
        options: {
          htmlmin: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-angular-templates');

  grunt.registerTask('default', ['uglify', 'ngtemplates', 'concat', 'cssmin']);

};
