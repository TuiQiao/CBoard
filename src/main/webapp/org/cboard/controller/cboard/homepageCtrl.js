/**
 * Created by zyong on 2017/10/31.
 */
cBoard.controller('homepageCtrl', function ($rootScope, $scope, $state, $http, $filter, $uibModal, $timeout, ModalUtils) {

    var translate = $filter('translate');
    var treeID = 'dataSetTreeID';
    var originalData = [];

    var getDatasetList = function () {
        $http.get("dashboard/getDatasetList.do").success(function (response) {
            $scope.datasetList = response;
            $scope.searchNode();
        });
    };

    /**  js tree related start **/
    $scope.treeConfig = jsTreeConfig1;

    var getSelectedDataSet = function () {
        var selectedNode = jstree_GetSelectedNodes(treeID)[0];
        return _.find($scope.datasetList, function (ds) {
            return ds.id == selectedNode.id;
        });
    };

    var checkTreeNode = function (actionType) {
        return jstree_CheckTreeNode(actionType, treeID, ModalUtils.alert);
    };

    $scope.applyModelChanges = function () {
        return !$scope.ignoreChanges;
    };

    $scope.showInfo = function () {
        if (!checkTreeNode("info")) return;
        var content = getSelectedDataSet();
        ModalUtils.info(content,"modal-info", "lg");
    };

    $scope.treeEventsObj = function () {
        var baseEventObj = jstree_baseTreeEventsObj({
            ngScope: $scope, ngHttp: $http, ngTimeout: $timeout,
            treeID: treeID, listName: "datasetList",
        });
        return baseEventObj;
    }();

    $scope.editNode = function () {
        if (!checkTreeNode("edit")) return;
        var selectedNode = jstree_GetSelectedNodes(treeID)[0];
        $state.go('config.widget', {datasetId: selectedNode.id}, {inherit: false});
    };

    $scope.searchNode = function () {
        var para = {dsName: '', dsrName: ''};
        //map datasetList to list (add datasourceName)
        var list = $scope.datasetList.map(function (ds) {
            var dsr = _.find($scope.datasourceList, function (obj) {
                return obj.id == ds.data.datasource
            });
            return {
                "id": ds.id,
                "name": ds.name,
                "categoryName": ds.categoryName,
                "datasourceName": dsr ? dsr.name : ''
            };
        });
        //split search keywords
        if ($scope.keywords) {
            if ($scope.keywords.indexOf(' ') == -1 && $scope.keywords.indexOf(':') == -1) {
                para.dsName = $scope.keywords;
            } else {
                var keys = $scope.keywords.split(' ');
                for (var i = 0; i < keys.length; i++) {
                    var w = keys[i].trim();
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
            $filter('filter')(list, {name: para.dsName, datasourceName: para.dsrName})
        );

        jstree_ReloadTree(treeID, originalData);
        $timeout(function() {$scope.treeInstance.jstree(true).open_all()}, 500);
    };

    getDatasetList();

    $scope.jstree_open_all = function () {
        $scope.treeInstance.jstree(true).open_all();
    };

    $scope.jstree_close_all = function () {
        $scope.treeInstance.jstree(true).close_all();
    }
});