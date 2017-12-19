/**
 * Created by zyong on 2017/10/31.
 */
cBoard.controller('homepageCtrl', function ($rootScope, $scope, $state, $http, $filter, $uibModal, $timeout, ModalUtils) {

    var translate = $filter('translate');
    var treeID = 'dataSetTreeID';
    var originalData = [];
    $scope.folderIds = [];

    var getDatasetList = function () {
        $http.get("dashboard/getDatasetList.do").success(function (response) {
            $scope.datasetList = response;

            $scope.folderIds = angular.toJson(_.uniq($scope.datasetList.map(function (item) {
                return item.folderId;
            })));

            $scope.getFolderList();
        });
    };

    $scope.getFolderList = function () {
        $http.post('dashboard/getFolderFamilyTree.do', {folderIds: $scope.folderIds}).success(function (response) {
            $scope.folderList = response;

            $scope.folderData = [];
            for (var i=0; i<$scope.folderList.length; i++){
                $scope.folderData.push({
                    "id": $scope.folderList[i].id.toString(),
                    "parent": $scope.folderList[i].parentId == -1 ? "#" : $scope.folderList[i].parentId.toString(),
                    "text": $scope.folderList[i].name.toString(),
                    "type": "parent"
                });
            }
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
        //map datasetList to list (add datasourceName)
        var list = $scope.datasetList.map(function (ds) {
            return {
                "id": ds.id,
                "name": ds.name,
                "parentId": ds.folderId,
                "type": "child"
            };
        });

        //filter data by keywords
        originalData = jstree_CvtVPath2TreeData(list);

        for (var i=0; i<$scope.folderList.length; i++){
            originalData.push({
                "id": $scope.folderList[i].id.toString(),
                "parent": $scope.folderList[i].parentId == -1 ? "#" : $scope.folderList[i].parentId.toString(),
                "text": $scope.folderList[i].name.toString(),
                "type": "parent"
            });
        }
        
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