'use strict';

var evid = angular.module('evid', [
  'ngRoute',
  'ngSanitize',
  'ngMaterial',
  'ngAnimate',
  'hljs',
  'evid.definition',
  'evid.registry',
  'evid.schema',
  'evid.api',
  'evid.page'
]);

evid.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/api/:api*?', {
      templateUrl: 'partials/api.html',
      controller: 'ApiCtrl'
    })
    .when('/page/:page?', {
      templateUrl: 'partials/page.html',
      controller: 'PageCtrl'
    })
    .otherwise({
      redirectTo: '/api/'
    });
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

evid.filter('ucfirst', function() {
  return function(input) {
    if (input) {
      return input.charAt(0).toUpperCase() + input.substring(1);
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
    definition.initialize().then(function(def){
      $scope.routings = def.getRoutings();
    });
  };

  $scope.loadRoutings();

}]);

evid.run(function() {

});

