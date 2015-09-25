'use strict';

angular.module('evid.page', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/page/:page*', {
    templateUrl: 'partials/page.html',
    controller: 'PageCtrl'
  });
}])

.controller('PageCtrl', ['$scope', '$http', '$routeParams', '$filter', 'menu', function($scope, $http, $routeParams, $filter, menu){

    $scope.title;
    $scope.body;

    $scope.loadDocument = function(){
        var slugify = $filter('slugify');
        var item = false;

        for (var i = 0; i < menu.length; i++) {
            if (slugify(menu[i].title) == $routeParams.page) {
                item = menu[i];
                break;
            }
        }

        if (item) {
            $scope.title = item.title;

            $http.get(item.href).success(function(resp){
                $scope.body = resp;
            }).error(function(resp){
                $scope.body = resp;
            });
        } else {
            $scope.title = 'Page not found';
        }
    };

    $scope.loadDocument();

}]);
