'use strict';

angular.module('evid.definition', [])

.service('definition', ['$http', '$q', 'evid', 'registry', function definition($http, $q, evid, registry) {

  /**
   * Requests the API definition of the endpoint which was provided through the
   * url config value. Returns a promise which contains the definition if it
   * gets resolved. The response is saved in the global registry so we make the
   * http request only once
   */
  this.initialize = function() {
    if (registry.has('definition')) {
      return $q(function(resolve, reject) {
        resolve(registry.get('definition'));
      });
    }

    return $q(function(resolve, reject) {
      $http.get(evid.url).then(function(response) {
        registry.set('definition', new Def(response.data, evid.exclude));
        resolve(registry.get('definition'));
      }, function() {
        reject();
      });
    });
  };

  function Def(api, exclude) {

    this.api = api;
    this.exclude = exclude;

    this.getRoutings = function() {
      var routings = [];

      // check whether the routing is not in the excluded list
      if (angular.isArray(this.api.routings)) {
        if (angular.isArray(this.exclude)) {
          for (var i = 0; i < this.api.routings.length; i++) {
            var exclude = false;
            for (var j = 0; j < this.exclude.length; j++) {
              if (this.api.routings[i].path.match(this.exclude[j])) {
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
    };

    this.getFirstRoute = function() {
      var routings = this.getRoutings();
      if (routings.length > 0) {
        return routings[0];
      }
      return null;
    };

    this.hasEmptyRoute = function() {
      var routings = this.getRoutings();
      for (var i = 0; i < routings.length; i++) {
        if (routings[i].path == '/') {
          return true;
        }
      }
      return false;
    };

    this.getLinkByRel = function(rel) {
      if (this.api && this.api.links && angular.isArray(this.api.links)) {
        for (var i = 0; i < this.api.links.length; i++) {
          if (this.api.links[i].rel == rel) {
            return this.api.links[i].href;
          }
        }
      }

      return null;
    };

  }

}]);

