'use strict';

angular.module('evid.definition', [])

.service('definition', function() {
  var api;

  this.setDefinition = function(api) {
    this.api = api;
  };

  this.getRoutings = function() {
    var routings = [];

    // check whether the routing is not in the excluded list
    if (angular.isArray(this.api.routings)) {
      if (angular.isArray(evid.exclude)) {
        for (var i = 0; i < this.api.routings.length; i++) {
          var exclude = false;
          for (var j = 0; j < evid.exclude.length; j++) {
            if (this.api.routings[i].path.match(evid.exclude[j])) {
              exclude = true;
              break;
            }
          }

          if (!exclude) {
            routings.push(this.api.routings[i]);
          }
        }
      } else {
        routings = this.api.routings;
      }
    }

    return routings;
  }

  this.getLinkByRel = function(rel) {
    for (var i = 0; i < this.api.links.length; i++) {
      if (this.api.links[i].rel == rel) {
        return this.api.links[i].href;
      }
    }

    return null;
  };

});
