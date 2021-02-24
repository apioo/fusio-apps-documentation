'use strict';

angular.module('evid.definition', [])

.service('definition', ['$http', '$q', 'evid', 'registry', function definition($http, $q, evid, registry) {

    /**
     * Requests the API definition of the endpoint which was provided through the
     * url config value. Returns a promise which contains the definition if it
     * gets resolved. The response is saved in the global registry so we make the
     * http request only once
     */
    this.initialize = function (category) {
        function loadHome() {
            if (registry.has('home')) {
                return $q(function (resolve, reject) {
                    resolve(registry.get('home'));
                });
            }

            return $q(function (resolve, reject) {
                $http.get(evid.url).then(function (response) {
                    var home = new Home(response.data);
                    registry.set('home', home);
                    resolve(home);
                }, function () {
                    reject();
                });
            });
        }

        function loadDocumentation(home, category) {
            if (registry.has('definition_' + category)) {
                return $q(function (resolve, reject) {
                    resolve(registry.get('definition_' + category));
                });
            }

            var docUrl = home.getLinkByRel('documentation')
            if (!docUrl) {
                docUrl = evid.url + '/system/doc';
            }

            if (category) {
                docUrl+= '?filter=' + category;
            }

            return $q(function (resolve, reject) {
                $http.get(docUrl).then(function (response) {
                    var def = new Def(response.data, evid.exclude);
                    registry.set('definition_' + category, def);
                    resolve(def);
                }, function() {
                    reject();
                });
            });
        }

        return $q(function (resolve, reject) {
            loadHome().then((home) => {
                loadDocumentation(home, category).then((def) => {
                    resolve({
                        def,
                        home
                    });
                }, () => {
                    reject();
                });
            }, () => {
                reject();
            });
        });
    };

    function Home(data) {
        this.apiVersion = data.apiVersion;
        this.title = data.title;
        this.description = data.description;
        this.contactUrl = data.contactUrl;
        this.contactEmail = data.contactEmail;
        this.apps = angular.isObject(data.apps) ? data.apps : {};
        this.categories = angular.isArray(data.categories) ? data.categories : [];
        this.scopes = angular.isArray(data.scopes) ? data.scopes : [];
        this.links = angular.isArray(data.links) ? data.links : [];

        this.getLinkByRel = function (rel) {
            for (var i = 0; i < this.links.length; i++) {
                if (this.links[i].rel === rel) {
                    return this.links[i].href;
                }
            }

            return null;
        };
    }

    function Def(data, exclude) {
        this.api = data;
        this.exclude = exclude;
        this.links = angular.isArray(data.links) ? data.links : [];

        this.getRoutings = function () {
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

        this.getFirstRoute = function () {
            var routings = this.getRoutings();
            if (routings.length > 0) {
                return routings[0];
            }
            return null;
        };

        this.hasEmptyRoute = function () {
            var routings = this.getRoutings();
            for (var i = 0; i < routings.length; i++) {
                if (routings[i].path === '/') {
                    return true;
                }
            }
            return false;
        };

        this.getLinkByRel = function (rel) {
            for (var i = 0; i < this.links.length; i++) {
                if (this.links[i].rel === rel) {
                    return this.links[i].href;
                }
            }

            return null;
        };
    }

}]);

