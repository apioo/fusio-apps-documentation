'use strict';

angular.module('evid.registry', [])

.service('registry', function() {
  this.container = {};

  this.set = function(name, service) {
    this.container[name] = service;
  };

  this.get = function(name) {
    return this.has(name) ? this.container[name] : null;
  };

  this.has = function(name) {
    return this.container.hasOwnProperty(name);
  };

});
