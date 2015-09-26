'use strict';

angular.module('evid.page', [])

.controller('PageCtrl', ['$scope', '$http', '$compile', '$sce', '$routeParams', '$filter', 'menu', function($scope, $http, $compile, $sce, $routeParams, $filter, menu) {

  $scope.title;
  $scope.body;

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

      $http.get(item.href).then(function(resp) {
        var linkFn = $compile(resp.data);
        var el = linkFn($scope);

        $scope.body = $sce.trustAsHtml(el.html());
      }, function(resp) {
        $scope.title = resp.statusText;
        $scope.body = '';
      });
    } else {
      $scope.title = 'Page not found';
      $scope.body = '';
    }
  };

  $scope.loadDocument();

}]);
