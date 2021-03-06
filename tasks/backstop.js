/*
 * grunt-backstop
 * https://github.com/danlucas/grunt-backstop
 *
 * Copyright (c) 2015 Dan Lucas
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {


  grunt.registerMultiTask('backstop', 'backstopjs shim for grunt', function() {

    var child_process = require('child_process'),
        async = require('async'),
        path = require('path');

    var cwd = process.cwd(),
        done = this.async();

    var options = this.options({
      backstop_path: './bower_components/backstopjs',
      test_path: './tests',
      config_path: '',
      setup: false,
      configure: false,
      create_references: false,
      run_tests: false
    });

    function BackstopShim(data, done) {

      this.backstop_path = path.join(cwd, data.backstop_path);
      this.test_path = path.join(cwd, data.test_path);
      this.options = {
        setup: data.setup,
        configure: data.configure,
        create_references: data.create_references,
        run_tests: data.run_tests,
        config_path: data.config_path
      };
      this.done = done;

      this.log = function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err !== null) {
          console.log('ERROR: ' + err);
        }
      };

      this.setup = function(backstop_path, test_path, cb) {
        child_process.exec('npm run genConfig', {cwd: backstop_path}, function(err, stdout, stderr) {
          this.log(err, stdout, stderr);
          cb();
        }.bind(this));
      };

      this.configure = function(backstop_path, test_path, cb) {
        child_process.exec('npm install', {cwd: backstop_path}, function(err, stdout, stderr) {
          this.log(err, stdout, stderr);
          cb(true);
        }.bind(this));
      };

      this.run_tests = function(backstop_path, test_path, cb) {
        var configPathCommand = '';
        if (this.options.config_path !== '') {
          configPathCommand = ' -- --configPath=' + cwd + '/' + this.options.config_path;
        }

        child_process.exec('npm run test' + configPathCommand, {cwd: backstop_path}, function(err, stdout, stderr) {
          this.log(err, stdout, stderr);
          cb(true);
        }.bind(this)).stdout.pipe(process.stdout);
      };

      this.create_references = function(backstop_path, test_path, cb) {
        var configPathCommand = '';
        if (this.options.config_path !== '') {
          configPathCommand = ' -- --configPath=' + cwd + '/' + this.options.config_path;
        }

        child_process.exec('npm run reference' + configPathCommand, {cwd: backstop_path}, function(err, stdout, stderr) {
          this.log(err, stdout, stderr);
          cb(true);
        }.bind(this)).stdout.pipe(process.stdout);
      };

    }

    var backstop_shim = new BackstopShim(options, done);

    async.series([
      function(cb) {
        if (this.options.setup) {
          this.setup(this.backstop_path, this.test_path, function() {
            cb();
          });
        } else cb();
      }.bind(backstop_shim),
      function(cb) {
        if (this.options.configure) {
          this.configure(this.backstop_path, this.test_path, function() {
            cb();
          });
        } else cb();
      }.bind(backstop_shim),
      function(cb) {
        if (this.options.create_references) {
          this.create_references (this.backstop_path, this.test_path, function() {
            cb();
          });
        } else cb();
      }.bind(backstop_shim),
      function(cb) {
        if (this.options.run_tests) {
          this.run_tests(this.backstop_path, this.test_path, function() {
            cb();
          });
        } else cb();
      }.bind(backstop_shim)
    ], function(err, result) {
      this.done(true);
    }.bind(backstop_shim));

  });

};
