/**
 * Created by yfyuan on 2016/10/11.
 */
cBoard.controller('datasetCtrl', function ($scope, $http, ModalUtils) {

    $scope.optFlag = 'none';
    $scope.curDataset = {};
    $scope.curWidget = {}

    var getDatasetList = function () {
        $http.get("/dashboard/getDatasetList.do").success(function (response) {
            $scope.datasetList = response;
        });
    };

    var getCategoryList = function () {
        $http.get("/dashboard/getDatasetCategoryList.do").success(function (response) {
            $scope.categoryList = response;
        });
    };

    getCategoryList();
    getDatasetList();

    $http.get("/dashboard/getDatasourceList.do").success(function (response) {
        $scope.datasourceList = response;
    });

    $scope.newDs = function () {
        $scope.optFlag = 'new';
        $scope.curDataset = {};
    };
    $scope.editDs = function (ds) {
        $scope.optFlag = 'edit';
        $scope.curDataset = angular.copy(ds);
        $scope.datasource = _.find($scope.datasourceList, function (ds) {
            return ds.id == $scope.curDataset.data.datasource;
        });
        $scope.curWidget.query = $scope.curDataset.data.query;
    };
    $scope.deleteDs = function (ds) {
        ModalUtils.confirm("确认删除吗？", "modal-warning", "lg", function () {
            $http.post("/dashboard/deleteDataset.do", {id: ds.id}).success(function () {
                $scope.optFlag = 'none';
                getDatasetList();
            });
        });
    };

    $scope.save = function () {
        $scope.curDataset.data = {};
        $scope.curDataset.data.datasource = $scope.datasource.id;
        $scope.curDataset.data.query = $scope.curWidget.query;
        if ($scope.optFlag == 'new') {
            $http.post("/dashboard/saveNewDataset.do", {json: angular.toJson($scope.curDataset)}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    $scope.optFlag = 'none';
                    getCategoryList();
                    getDatasetList();
                    ModalUtils.alert("成功", "modal-success", "sm");
                } else {
                    ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                }
            });
        } else {
            $http.post("/dashboard/updateDataset.do", {json: angular.toJson($scope.curDataset)}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    $scope.optFlag = 'none';
                    getCategoryList();
                    getDatasetList();
                    ModalUtils.alert("成功", "modal-success", "sm");
                } else {
                    ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                }
            });
        }

    };

});