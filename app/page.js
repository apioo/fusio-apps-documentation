'use strict';

angular.module('evid.page', [])

.controller('PageCtrl', ['$scope', '$http', '$compile', '$sce', '$routeParams', '$filter', 'evid', function ($scope, $http, $compile, $sce, $routeParams, $filter, evid) {

    $scope.title = '';
    $scope.href = '';

    $scope.loadDocument = function () {
        var slugify = $filter('slugify');
        var item = false;

        var title = false;
        if ($routeParams.page) {
            title = $routeParams.page;
        }

        for (var i = 0; i < evid.menu.length; i++) {
            if (slugify(evid.menu[i].title) == title || title === false) {
                item = evid.menu[i];
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
