/**
 * Created by yfyuan on 2016/8/19.
 */
cBoard.controller('datasourceCtrl', function ($scope, $http, ModalUtils, $uibModal, $filter) {

    var translate = $filter('translate');
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
        ModalUtils.confirm(translate("COMMON.CONFIRM_DELETE"), "modal-warning", "lg", function () {
            $http.post("/dashboard/deleteDatasource.do", {id: ds.id}).success(function () {
                $scope.optFlag = 'none';
                getDatasourceList();
            });
        });
    };
    $scope.copyDs = function (ds) {
        var data=angular.copy(ds);
        data.name=data.name+"_copy";
        $http.post("/dashboard/saveNewDatasource.do", {json: angular.toJson(data)}).success(function (serviceStatus) {
            if (serviceStatus.status == '1') {
                $scope.optFlag = 'none';
                getDatasourceList();
                ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
            } else {
                ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
            }
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
                ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
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
                ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
            } else {
                ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
            }
        });
    };

    $scope.test = function () {
        var datasource = $scope.curDatasource;
        $uibModal.open({
            templateUrl: 'org/cboard/view/config/modal/test.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            size: 'lg',
            backdrop: false,
            controller: function ($scope, $uibModalInstance) {
                $scope.datasource = datasource;
                $scope.curWidget = {query: {}};
                $scope.alerts = [];
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.do = function () {
                    $http.post("/dashboard/test.do", {
                        datasource: angular.toJson($scope.datasource),
                        query: angular.toJson($scope.curWidget.query)
                    }).success(function (result) {
                        if (result.status != '1') {
                            $scope.alerts = [{
                                msg: result.msg,
                                type: 'danger'
                            }];
                        } else {
                            $scope.alerts = [{
                                msg: translate("COMMON.SUCCESS"),
                                type: 'success'
                            }];
                        }
                    });
                };
            }
        });
    };


});