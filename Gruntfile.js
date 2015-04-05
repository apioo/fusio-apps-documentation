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
          './bower_components/jquery/dist/jquery.min.js',
          './bower_components/bootstrap/dist/js/bootstrap.min.js',
          './bower_components/highlightjs/highlight.pack.js',
          './build/evid-app.min.js'
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
          './bower_components/bootstrap/dist/css/bootstrap.min.css',
          './bower_components/bootstrap/dist/css/bootstrap-theme.min.css',
          './build/highlightjs-theme.min.css'
        ],
        dest: './dist/evid.min.css'
      }
    },
    copy: {
      app_css: {
        src: './app/app.css',
        dest: './dist/app.css',
      },
      config_js: {
        src: './app/config.js',
        dest: './dist/config.js',
      }
    },
    cssmin: {
      highlite_style: {
        src: './bower_components/highlightjs/styles/github.css',
        dest: './build/highlightjs-theme.min.css',
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['uglify', 'cssmin', 'concat', 'copy']);

};
