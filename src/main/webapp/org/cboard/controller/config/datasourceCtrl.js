/**
 * Created by yfyuan on 2016/8/19.
 */
cBoard.controller('datasourceCtrl', function ($scope, $http, ModalUtils) {

    $scope.optFlag = 'none';
    $scope.dsView = '';
    $scope.curDatasource = {};

    var getDatasourceList = function () {
        $http.get("/dashboard/getDatasourceList.do").success(function (response) {
            $scope.datasourceList = response;
        });
    };

    getDatasourceList();

    $http.get("/dashboard/getProviderList.do").success(function (response) {
        $scope.providerList = response;
    });

    $scope.newDs = function () {
        $scope.optFlag = 'new';
        $scope.curDatasource = {config: {}};
        $scope.dsView = '';
    };
    $scope.editDs = function (ds) {
        $scope.optFlag = 'edit';
        $scope.curDatasource = angular.copy(ds);
        $scope.changeDsView();
    };
    $scope.deleteDs = function (ds) {
        ModalUtils.confirm("确认删除吗？", "modal-warning", "lg", function () {
            $http.post("/dashboard/deleteDatasource.do", {id: ds.id}).success(function () {
                $scope.optFlag = 'none';
                getDatasourceList();
            });
        });
    };


    $scope.changeDsView = function () {
        $scope.dsView = '/dashboard/getDatasourceView.do?type=' + $scope.curDatasource.type;
    };

    $scope.saveNew = function () {
        $http.post("/dashboard/saveNewDatasource.do", {json: angular.toJson($scope.curDatasource)}).success(function (serviceStatus) {
            if (serviceStatus.status == '1') {
                $scope.optFlag = 'none';
                getDatasourceList();
                ModalUtils.alert("成功", "modal-success", "sm");
            } else {
                ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
            }
        });
    };

    $scope.saveEdit = function () {
        $http.post("/dashboard/updateDatasource.do", {json: angular.toJson($scope.curDatasource)}).success(function (serviceStatus) {
            if (serviceStatus.status == '1') {
                $scope.optFlag = 'none';
                getDatasourceList();
                ModalUtils.alert("成功", "modal-success", "sm");
            } else {
                ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
            }
        });
    };


});