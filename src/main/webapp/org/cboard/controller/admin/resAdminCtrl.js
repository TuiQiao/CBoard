/**
 * Created by yfyuan on 2016/12/7.
 */
cBoard.controller('resAdminCtrl', function ($scope, $http, ModalUtils, $filter, $q) {
    var translate = $filter('translate');

    $scope.resTypeList = [{name: translate('ADMIN.BOARD'), value: 'board'}, {
        name: translate('ADMIN.MENU'),
        value: 'menu'
    }, {
        name: translate('ADMIN.DATASOURCE'),
        value: 'datasource'
    }, {
        name: translate('ADMIN.DATASET'),
        value: 'dataset'
    }, {
        name: translate('ADMIN.WIDGET'),
        value: 'widget'
    }];

    $scope.resList = [{id: 'Menu', text: 'Menu', parent: '#'}, {
        id: 'Dashboard',
        text: 'Dashboard',
        parent: '#',
    }, {
        id: 'Datasource',
        text: 'Datasource',
        parent: '#'
    }, {id: 'Dataset', text: 'Cube', parent: '#'}, {id: 'Widget', text: 'Widget', parent: '#'}];

    var getRoleList = function () {
        $http.get("/admin/getRoleList.do").success(function (response) {
            $scope.roleList = response;
        });
    };
    getRoleList();

    var getBoardList = function () {
        return $http.get("/dashboard/getBoardList.do").success(function (response) {
            _.each(_.filter(response, function (e) {
                return e.categoryId;
            }), function (e) {
                $scope.resList.push({
                    id: 'Dashboard_' + e.id, text: e.name, parent: 'Dashboard', resId: e.id,
                    type: 'board'
                });
            });
        });
    };

    var getMenuList = function () {
        return $http.get("/commons/getMenuList.do").success(function (response) {
            $scope.menuList = response;
            _.each(response, function (e) {
                $scope.resList.push({
                    id: 'menu_' + e.menuId,
                    text: translate(e.menuName),
                    parent: e.parentId == -1 ? 'Menu' : ('menu_' + e.parentId),
                    resId: e.menuId,
                    type: 'menu'
                });
            });
        });
    };

    var getDatasourceList = function () {
        return $http.get("/dashboard/getDatasourceList.do").success(function (response) {
            _.each(response, function (e) {
                $scope.resList.push({
                    id: 'Datasource_' + e.id, text: e.name, parent: 'Datasource', resId: e.id,
                    type: 'datasource'
                });
            });
        });
    };

    var getDatasetList = function () {
        return $http.get("/dashboard/getDatasetList.do").success(function (response) {
            _.each(response, function (e) {
                $scope.resList.push({
                    id: 'Dataset_' + e.id, text: e.name, parent: 'Dataset', resId: e.id,
                    type: 'dataset'
                });
            });
        });
    };

    var getWidgetList = function () {
        return $http.get("/dashboard/getWidgetList.do").success(function (response) {
            _.each(response, function (e) {
                $scope.resList.push({
                    id: 'widget_' + e.id,
                    text: e.name,
                    parent: 'Widget',
                    resId: e.id,
                    type: 'widget'
                });
            });
        });
    };

    var getRoleResList = function () {
        $http.get("/admin/getRoleResList.do").success(function (response) {
            $scope.roleResList = response;
        }).then(function () {
            return getBoardList();
        }).then(function () {
            return getMenuList();
        }).then(function () {
            return getDatasourceList();
        }).then(function () {
            return getDatasetList();
        }).then(function () {
            return getWidgetList();
        }).then(function () {
            $scope.treeConfig = {
                core: {
                    multiple: true,
                    animation: true,
                    error: function (error) {
                    },
                    check_callback: true,
                    worker: true
                },
                checkbox: {
                    three_state: false
                },
                version: 1,
                plugins: ['types', 'checkbox']
            };
        });
    };
    getRoleResList();

    $scope.changeResSelect = function () {
        $scope.treeInstance.jstree(true).open_all();
        if ($scope.selectRole && $scope.selectRole.length == 1) {
            var roleRes = _.filter($scope.roleResList, function (e) {
                return e.roleId == $scope.selectRole[0].roleId;
            });
            $scope.treeInstance.jstree(true).uncheck_all();
            _.each($scope.resList, function (e) {
                var f = _.find(roleRes, function (rr) {
                    return rr.resId == e.resId && rr.resType == e.type;
                });
                if (!_.isUndefined(f)) {
                    $scope.treeInstance.jstree(true).check_node(e);
                }
            });
        }
    };

    $scope.grant = function () {
        var roleIds = _.map($scope.selectRole, function (e) {
            return e.roleId;
        });
        var resIds = _.map($scope.treeInstance.jstree(true).get_checked(true), function (e) {
            return {resId: e.original.resId, resType: e.original.type};
        });
        $http.post("/admin/updateRoleRes.do", {
            roleIdArr: angular.toJson(roleIds),
            resIdArr: angular.toJson(resIds),
        }).success(function (serviceStatus) {
            if (serviceStatus == '1') {
                $scope.selectRole = null;
                $scope.selectRes = null;
                getRoleResList();
                ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
            } else {
                $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
            }
        });

    };

});