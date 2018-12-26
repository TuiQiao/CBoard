/**
 * Created by Peter on 2016/10/22.
 */


angular.module('cBoard').config(['$stateProvider', function ($stateProvider) {
    $stateProvider
        .state('home', CB_HOMEPAGE_SETTING )
        .state('dashboard', {
            url: '/dashboard',
            abstract: true,
            template: '<div ui-view></div>'
        })
        .state('mine', {
            url: '/mine',
            abstract: true,
            template: '<div ui-view></div>'
        })
        .state('mine.view', {
            url: '/{id}',
            params: {id: null},
            templateUrl: 'org/cboard/view/dashboard/view.html',
            controller: 'dashboardViewCtrl'
        })
        .state('dashboard.category', {
            url: '/{category}',
            params: {category: null},
            abstract: true,
            template: '<div ui-view></div>',
        })
        .state('dashboard.category.view', {
            url: '/{id}',
            params: {id: null},
            templateUrl: 'org/cboard/view/dashboard/view.html',
            controller: 'dashboardViewCtrl'
        })
        .state('config', {
            url: '/config',
            abstract: true,
            template: '<div ui-view></div>'
        })
        .state('config.board', {
            url: '/board/{boardId}',
            params: {boardId: null},
            templateUrl: 'org/cboard/view/config/board.html',
            controller: 'boardCtrl'
        })
        .state('config.widget', {
            url: '/widget?id&datasetId',
            params: {id: null, datasetId: null},
            templateUrl: 'org/cboard/view/config/widget.html',
            controller: 'widgetCtrl'
        })
        .state('config.datasource', {
            url: '/datasource/{id}',
            params: {id: null},
            templateUrl: 'org/cboard/view/config/datasource.html',
            controller: 'datasourceCtrl'
        })
        .state('config.category', {
            url: '/category',
            templateUrl: 'org/cboard/view/config/category.html',
            controller: 'categoryCtrl'
        })
        .state('config.homepage', {
            url: '/homepage/{boardId}',
            params: {boardId: null},
            templateUrl: 'org/cboard/view/config/homepage.html',
            controller: 'homepageSettingCtrl'
        })
        .state('config.dataset', {
            url: '/dataset/{id}',
            params: {id: null},
            templateUrl: 'org/cboard/view/config/dataset.html',
            controller: 'datasetCtrl'
        })
        .state('config.job', {
            url: '/job',
            templateUrl: 'org/cboard/view/config/job.html',
            controller: 'jobCtrl'
        })
        .state('config.role', {
            url: '/role',
            templateUrl: 'org/cboard/view/config/shareResource.html',
            controller: 'shareResCtrl'
        })
        .state('admin', {
            url: '/admin',
            abstract: true,
            template: '<div ui-view></div>'
        })
        .state('admin.user', {
            url: '/user',
            templateUrl: 'org/cboard/view/admin/user.html',
            controller: 'userAdminCtrl'
        })
        .state('config.cockpit', {
            url: '/cockpit/{boardId}',
            params: {boardId: null},
            templateUrl: 'org/cboard/view/config/board/cockpit/view.html',
            controller: 'cockpitLayoutCtrl'
        })
}]);

angular.module('cBoard').factory('sessionHelper', ["$rootScope", "$q", function ($rootScope, $q) {
    var sessionHelper = {
        responseError: function (response) {
            if (response.data.status == 2) {
                if ($rootScope.alert) {
                    $rootScope.alert(response.data.msg);
                }
            }
            return $q.reject(response);
        }
    };
    return sessionHelper;
}]);


angular.module('cBoard').config(function ($httpProvider) {
    $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function (data) {
        /**
         * The workhorse; converts an object to x-www-form-urlencoded serialization.
         * @param {Object} obj
         * @return {String}
         */
        var param = function (obj) {
            var query = '';
            var name, value, fullSubName, subName, subValue, innerObj, i;

            for (name in obj) {
                value = obj[name];

                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value instanceof Object) {
                    for (subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value !== undefined && value !== null) {
                    query += encodeURIComponent(name) + '='
                        + encodeURIComponent(value) + '&';
                }
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        return angular.isObject(data) && String(data) !== '[object File]'
            ? param(data)
            : data;
    }];

    $httpProvider.interceptors.push('sessionHelper');

});


angular.module('cBoard').config(function ($translateProvider, $translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('cboard');
    $translateProvider.useLoader('$translatePartialLoader', {
        urlTemplate: 'i18n/{lang}/{part}.json'
    });

    $translateProvider.preferredLanguage(settings.preferredLanguage);
});