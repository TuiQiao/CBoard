/**
 * Created by yfyuan on 2016/8/19.
 */
cBoard.controller('datasourceCtrl', function ($scope, $state, $stateParams, $http, ModalUtils, $uibModal, $filter, $q) {

    var translate = $filter('translate');
    $scope.optFlag = 'none';
    $scope.dsView = '';
    $scope.curDatasource = {};
    $scope.alerts = [];
    $scope.verify = {dsName:true,provider:true};
    $scope.params = [];
    
    var getDatasourceList = function () {
        $http.get("dashboard/getDatasourceList.do").success(function (response) {
            $scope.datasourceList = response;
            if ($stateParams.id) {
                $scope.editDs(_.find($scope.datasourceList, function (dsr) {
                    return dsr.id == $stateParams.id;
                }));
            }
        });
    };

    getDatasourceList();

    $http.get("dashboard/getProviderList.do").success(function (response) {
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
        $scope.doDatasourceParams();
        $state.go('config.datasource', {id: ds.id}, {notify: false});
    };
    $scope.deleteDs = function (ds) {
        // var isDependent = false;
        var resDs = [];
        var resWdg = [];
        var promiseDs = $http.get("dashboard/getAllDatasetList.do").then(function (response) {
            if (!response) {
                return false;
            }

            for (var i = 0; i < response.data.length; i++) {
                if (response.data[i].data.datasource == ds.id) {
                    resDs.push(response.data[i].name);
                }
            }
        });

        var promiseWdg = $http.get("dashboard/getAllWidgetList.do").then(function (response) {
            if (!response) {
                return false;
            }

            for (var i = 0; i < response.data.length; i++) {
                if (response.data[i].data.datasource == ds.id) {
                    resWdg.push(response.data[i].name);
                }
            }
        });

        var p = $q.all([promiseDs, promiseWdg]);
        p.then(function () {
            if (resDs.length > 0 || resWdg.length > 0) {
                var warnStr = '   ';
                if (resDs.length > 0) {
                    warnStr += "   " + translate("CONFIG.DATASET.DATASET") + ": [" + resDs.toString() + "]";
                }
                if (resWdg.length > 0) {
                    warnStr += "   " + translate("CONFIG.WIDGET.WIDGET") + ": [" + resWdg.toString() + "]";
                }
                ModalUtils.alert(translate("COMMON.NOT_ALLOWED_TO_DELETE_BECAUSE_BE_DEPENDENT") + warnStr, "modal-warning", "lg");
                return false;
            }
            ModalUtils.confirm(translate("COMMON.CONFIRM_DELETE"), "modal-warning", "lg", function () {
                $http.post("dashboard/deleteDatasource.do", {id: ds.id}).success(function (serviceStatus) {
                    if (serviceStatus.status == '1') {
                        getDatasourceList();
                    } else {
                        ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                    }
                    $scope.optFlag = 'none';
                });
            });
        });
    };

    $scope.copyDs = function (ds) {
        var data = angular.copy(ds);
        data.name = data.name + "_copy";
        $http.post("dashboard/saveNewDatasource.do", {json: angular.toJson(data)}).success(function (serviceStatus) {
            if (serviceStatus.status == '1') {
                $scope.optFlag = 'none';
                getDatasourceList();
                ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
            } else {
                ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
            }
        });
    };
    $scope.showInfo = function (ds) {
        ModalUtils.info(ds,"modal-info", "lg");
    };
    $scope.changeDsView = function () {
        $scope.dsView = 'dashboard/getDatasourceView.do?type=' + $scope.curDatasource.type;
    };

    $scope.doDatasourceParams = function () {
        $http.get('dashboard/getDatasourceParams.do?type=' + $scope.curDatasource.type).then(function (response) {
            $scope.params = response.data;
        });
    };

    $scope.changeDs = function () {
        $scope.changeDsView();
        $scope.curDatasource.config = {};
        $http.get('dashboard/getDatasourceParams.do?type=' + $scope.curDatasource.type).then(function (response) {
            $scope.params = response.data;
            for(i in $scope.params){
                var name = $scope.params[i].name;
                var value = $scope.params[i].value;
                var checked = $scope.params[i].checked;
                var type = $scope.params[i].type;
                if(type == "checkbox" && checked == true){
                    $scope.curDatasource.config[name] = true;
                }if(type == "number" && value != "" && !isNaN(value)){
                    $scope.curDatasource.config[name] = Number(value);
                }else if(value != "") {
                    $scope.curDatasource.config[name] = value;
                }
            }
        });
    };
    
    var validate = function () {
        $scope.alerts = [];
        if($scope.curDatasource.type == null){
            $scope.alerts = [{msg: translate('CONFIG.DATA_SOURCE.DATA_PROVIDER')+translate('COMMON.NOT_EMPTY'), type: 'danger'}];
            $scope.verify = {provider : false};
            return false;
        }
        if(!$scope.curDatasource.name){
            $scope.alerts = [{msg: translate('CONFIG.DATA_SOURCE.NAME')+translate('COMMON.NOT_EMPTY'), type: 'danger'}];
            $scope.verify = {dsName : false};
            $("#DatasetName").focus();
            return false;
        }
        for (i in $scope.params) {
            var name = $scope.params[i].name;
            var label = $scope.params[i].label;
            var required = $scope.params[i].required;
            var value = $scope.curDatasource.config[name];
            if (required == true && value != 0 && (value == undefined || value == "")) {
                var pattern = /([\w_\s\.]+)/;
                var msg = pattern.exec(label);
                if(msg && msg.length > 0)
                    msg = translate(msg[0]);
                else
                    msg = label;
                $scope.alerts = [{msg: "[" + msg + "]" + translate('COMMON.NOT_EMPTY'), type: 'danger'}];
                $scope.verify[name] = false;
                return false;
            }
        }
        return true;
    };

    $scope.saveNew = function () {
        if(!validate()){
            return;
        }
        $http.post("dashboard/saveNewDatasource.do", {json: angular.toJson($scope.curDatasource)}).success(function (serviceStatus) {
            if (serviceStatus.status == '1') {
                $scope.optFlag = 'none';
                getDatasourceList();
                $scope.verify = {dsName:true,provider:true};
                ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
            } else {
                $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
            }
        });
    };

    $scope.saveEdit = function () {
        if(!validate()){
            return;
        }
        $http.post("dashboard/updateDatasource.do", {json: angular.toJson($scope.curDatasource)}).success(function (serviceStatus) {
            if (serviceStatus.status == '1') {
                $scope.optFlag = 'none';
                getDatasourceList();
                $scope.verify = {dsName:true,provider:true};
                ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
            } else {
                $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
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
                $scope.alerts = [];
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.curWidget = {query: {}};
                $http.get('dashboard/getConfigParams.do?type=' + $scope.datasource.type + '&page=test.html').then(function (response) {
                    $scope.params = response.data;
                    for(i in $scope.params){
                        var name = $scope.params[i].name;
                        var value = $scope.params[i].value;
                        var checked = $scope.params[i].checked;
                        var type = $scope.params[i].type;
                        if(type == "checkbox" && checked == true){
                            $scope.curWidget.query[name] = true;
                        }if(type == "number" && value != "" && !isNaN(value)){
                            $scope.curWidget.query[name] = Number(value);
                        }else if(value != "") {
                            $scope.curWidget.query[name] = value;
                        }
                    }
                });
                var validate = function () {
                    for(i in $scope.params){
                        var name = $scope.params[i].name;
                        var label = $scope.params[i].label;
                        var required = $scope.params[i].required;
                        var value = $scope.curWidget.query[name];
                        if (required == true && value != 0 && (value == undefined || value == "")) {
                            var pattern = /([\w_\s\.]+)/;
                            var msg = pattern.exec(label);
                            if(msg && msg.length > 0)
                                msg = translate(msg[0]);
                            else
                                msg = label;
                            $scope.alerts = [{msg: "[" + msg + "]" + translate('COMMON.NOT_EMPTY'), type: 'danger'}];
                            return false;
                        }
                    }
                    return true;
                };
                $scope.do = function () {
                    if (!validate()) {
                        return;
                    }
                    $http.post("dashboard/test.do", {
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