'use strict';

angular.module('evid.page', [])

.controller('PageCtrl', ['$scope', '$http', '$compile', '$sce', '$routeParams', '$filter', 'menu', function($scope, $http, $compile, $sce, $routeParams, $filter, menu) {

  $scope.title;
  $scope.href;

  $scope.loadDocument = function() {
    var slugify = $filter('slugify');
    var item = false;

    var title = false;
    if ($routeParams.page) {
      title = $routeParams.page;
    }

    for (var i = 0; i < menu.length; i++) {
      if (slugify(menu[i].title) == title || title === false) {
        item = menu[i];
        break;
      }
    }

    if (item) {
      $scope.title = item.title;
      $scope.href = item.href;
    } else {
      $scope.title = 'Page not found';
      $scope.href = null;
    }
  };

  $scope.loadDocument();

}]);
