/**
 * Created by Fine on 2017/2/12.
 */
'user strict';
cBoard.controller('freeLayoutCtrl', function($rootScope, $scope, $http, ModalUtils, $timeout, $stateParams, $filter, freeLayoutService){
    var treeID = 'widgetTreeID';
    var updateUrl = "dashboard/updateWidget.do";
    var originalData = [];
    var getWidgetList = function (callback) {
        $http.get("dashboard/getWidgetList.do").success(function (response) {
            $scope.widgetList = response;
            if (callback) {
                callback();
            }
            $scope.searchNode();
        });
    };
    var getCategoryList = function () {
        $http.get("dashboard/getWidgetCategoryList.do").success(function (response) {
            $scope.categoryList = response;
            $("#widgetName").autocomplete({
                source: $scope.categoryList
            });
        });
    };

    $(window).resize(function () {
        freeLayoutService.setHeight();
    });

    freeLayoutService.setHeight();

    $http.get("dashboard/getDatasourceList.do").success(function (response) {
        $scope.datasourceList = response;
        getCategoryList();
        getWidgetList(function () {
            if ($stateParams.id) {
                $scope.editWgt(_.find($scope.widgetList, function (w) {
                    return w.id == $stateParams.id;
                }));
            }
        });
    });
    
    $scope.searchNode = function () {
        var para = {wgtName: '', dsName: '', dsrName: ''};

        //map widgetList to list (add datasetName and datasourceName)
        var list = $scope.widgetList.map(function (w) {
            var ds = _.find($scope.datasetList, function (obj) {
                return obj.id == w.data.datasetId
            });
            var dsrName = '';
            if (ds) {
                dsrName = _.find($scope.datasourceList, function (obj) {
                    return obj.id == ds.data.datasource
                }).name;
            } else if (w.data.datasource) {
                _.find($scope.datasourceList, function (obj) {
                    return obj.id == w.data.datasource
                }).name
            }
            return {
                "id": w.id,
                "name": w.name,
                "categoryName": w.categoryName,
                "datasetName": ds ? ds.name : '',
                "datasourceName": dsrName
            };
        });

        //split search keywords
        if ($scope.keywords) {
            if ($scope.keywords.indexOf(' ') == -1 && $scope.keywords.indexOf(':') == -1) {
                para.wgtName = $scope.keywords;
            } else {
                var keys = $scope.keywords.split(' ');
                for (var i = 0; i < keys.length; i++) {
                    var w = keys[i].trim();
                    if (w.split(':')[0] == 'wg') {
                        para["wgtName"] = w.split(':')[1];
                    }
                    if (w.split(':')[0] == 'ds') {
                        para["dsName"] = w.split(':')[1];
                    }
                    if (w.split(':')[0] == 'dsr') {
                        para["dsrName"] = w.split(':')[1];
                    }
                }
            }
        }
        //filter data by keywords
        originalData = jstree_CvtVPath2TreeData(
            $filter('filter')(list, {name: para.wgtName, datasetName: para.dsName, datasourceName: para.dsrName})
        );

        jstree_ReloadTree(treeID, originalData);
    };

    $scope.treeConfig = jsTreeConfig1;

    $scope.applyModelChanges = function () {
        return !$scope.ignoreChanges;
    };

    $scope.treeEventsObj = function () {
        var baseEventObj = jstree_baseTreeEventsObj({
            ngScope: $scope, ngHttp: $http, ngTimeout: $timeout,
            treeID: treeID, listName: "widgetList", updateUrl: updateUrl
        });
        return baseEventObj;
    }();
    
    $scope.switchLayout = function () {
        $rootScope.freeLayout = false;
    }
});