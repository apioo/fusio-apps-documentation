module.exports = function(grunt){

  grunt.initConfig({
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
          './node_modules/highlightjs/highlight.pack.min.js',
          './node_modules/js-yaml/dist/js-yaml.min.js',
          './node_modules/marked/marked.min.js',
          './node_modules/angular/angular.min.js',
          './node_modules/angular-animate/angular-animate.min.js',
          './node_modules/angular-aria/angular-aria.min.js',
          './node_modules/angular-loader/angular-loader.min.js',
          './node_modules/angular-marked/dist/angular-marked.min.js',
          './node_modules/angular-material/angular-material.min.js',
          './node_modules/angular-route/angular-route.min.js',
          './node_modules/angular-sanitize/angular-sanitize.min.js',
          './node_modules/angular-highlightjs/angular-highlightjs.min.js',
          './dist/evid-app.min.js',
          './dist/evid-templates.min.js'
        ],
        dest: './dist/evid.min.js'
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
          './node_modules/angular-material/angular-material.css',
          './node_modules/highlightjs/styles/github.css',
          './css/app.css'
        ],
        dest: './dist/evid.min.css'
      }
    },
    uglify: {
      options: {
        banner: '/*\n evid\n Copyright (C) 2015-2019 Christoph Kappestein\n License: MIT\n*/\n',
        mangle: false
      },
      dist: {
        files: {
          './dist/evid-app.min.js': [
            './app/app.js',
            './app/api.js',
            './app/page.js',
            './app/components/definition.js',
            './app/components/registry.js',
            './app/components/schema.js'
          ]
        }
      }
    },
    cssmin: {
      compress_css: {
        src: './dist/evid.min.css',
        dest: './dist/evid.min.css'
      }
    },
    ngtemplates: {
      evid: {
        src: 'app/partials/*.html',
        dest: './dist/evid-templates.min.js',
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
