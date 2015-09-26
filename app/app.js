'use strict';

var evid = angular.module('evid', [
  'ngRoute',
  'ngSanitize',
  'ngMaterial',
  'ngAnimate',
  'hljs',
  'evid.definition',
  'evid.schema',
  'evid.api',
  'evid.page'
]);

evid.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    otherwise({redirectTo: '/'});
}]);

evid.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue')
    .accentPalette('grey');
});

evid.filter('slugify', function() {
  return function(input) {
    if (input) {
      return input.toLowerCase().replace(/\W+/g, '-');
    }
    return '';
  };
});

evid.controller('AppCtrl', ['$scope', '$http', '$mdSidenav', 'url', 'menu', 'definition', function($scope, $http, $mdSidenav, url, menu, definition) {

  $scope.menus = menu;
  $scope.routings = [];

  $scope.toggleSidebar = function() {
    $mdSidenav('left').toggle();
  };

  $scope.loadRoutings = function() {
    $http.get(url).success(function(data) {
          definition.setDefinition(data);

          $scope.routings = definition.getRoutings();
        });
  };

  $scope.loadRoutings();

}]);

evid.run(function() {

});

