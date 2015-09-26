'use strict';

angular.module('evid.api', [])

.controller('ApiCtrl', ['$scope', '$http', '$compile', '$sce', '$mdSidenav', '$routeParams', 'definition', 'schema', function($scope, $http, $compile, $sce, $mdSidenav, $routeParams, definition, schema) {

  $scope.api;
  $scope.methods;

  $scope.loadApi = function() {
    definition.initialize().then(function(def) {
      var url = def.getLinkByRel('detail');
      if (url) {
        url = url.replace('{version}', '*');
        url = url.replace('{path}', $routeParams.api ? $routeParams.api : '');

        $http.get(url).then(function(resp) {
          $scope.api = resp.data;
          if ($scope.api.methods) {
            var methods = {};
            for (var methodName in $scope.api.methods) {
              methods[methodName] = $scope.getSchema(methodName, $scope.api.methods[methodName]);
            }

            $scope.methods = methods;

            $mdSidenav('left').close();
          }
        });
      }
    });
  };

  $scope.getSchema = function(methodName, method) {
    var apiSchema = schema.create($scope.api);
    var html = apiSchema.getHtml(methodName, method);

    var linkFn = $compile(html);
    var el = linkFn($scope);

    return $sce.trustAsHtml(el.html());
  };

  $scope.loadApi();

}]);
