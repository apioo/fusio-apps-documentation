'use strict';

angular.module('evid.api', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/api/:api*', {
    templateUrl: 'partials/api.html',
    controller: 'ApiCtrl'
  });
}])

.controller('ApiCtrl', ['$scope', '$http', '$compile', '$sce', '$mdSidenav', '$routeParams', 'definition', 'schema', function($scope, $http, $compile, $sce, $mdSidenav, $routeParams, definition, schema) {

  $scope.api;
  $scope.methods;

  $scope.loadApi = function() {
    var url = definition.getLinkByRel('detail');
    if (url) {
      url = url.replace('{version}', '*');
      url = url.replace('{path}', $routeParams.api);

      $http.get(url).success(function(data) {
        $scope.api = data;
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
  };

  $scope.getSchema = function(methodName, method) {
    var apiSchema = schema.create($scope.api);
    var html = apiSchema.getHtml(methodName, method);

    console.log(html);

    var linkFn = $compile(html);
    var el = linkFn($scope);

    return $sce.trustAsHtml(el.html());
  };

  $scope.loadApi();

}]);
