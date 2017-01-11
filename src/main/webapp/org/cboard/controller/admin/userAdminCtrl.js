/**
 * Created by yfyuan on 2016/12/5.
 */
cBoard.controller('userAdminCtrl', function ($scope, $http, ModalUtils, $filter) {

    var translate = $filter('translate');
    $scope.optFlag;
    $scope.curUser;

    $http.get("admin/isAdmin.do").success(function (response) {
        $scope.isAdmin = response;
    });

    var getUserList = function () {
        $http.get("admin/getUserList.do").success(function (response) {
            $scope.userList = response;
        });
    };
    getUserList();

    var getRoleList = function () {
        $http.get("admin/getRoleList.do").success(function (response) {
            $scope.roleList = response;
        });
    };
    getRoleList();

    var getUserRoleList = function () {
        $http.get("admin/getUserRoleList.do").success(function (response) {
            $scope.userRoleList = response;
        });
    };
    getUserRoleList();

    $scope.resList = [{
        id: 'Menu',
        text: translate('ADMIN.MENU'),
        parent: '#',
        icon: 'fa fa-fw fa-folder-o',
        state: {disabled: true}
    }, {
        id: 'Dashboard',
        text: translate('ADMIN.BOARD'),
        parent: '#', icon: 'fa fa-fw fa-folder-o',
        state: {disabled: true}
    }, {
        id: 'Datasource',
        text: translate('ADMIN.DATASOURCE'),
        parent: '#', icon: 'fa fa-fw fa-folder-o',
        state: {disabled: true}
    }, {
        id: 'Dataset', text: translate('ADMIN.DATASET'), parent: '#', icon: 'fa fa-fw fa-folder-o',
        state: {disabled: true}
    }, {
        id: 'Widget',
        text: translate('ADMIN.WIDGET'),
        parent: '#',
        icon: 'fa fa-fw fa-folder-o',
        state: {disabled: true}
    }];

    var getBoardList = function () {
        return $http.get("dashboard/getBoardList.do").success(function (response) {
            _.each(buildNodeByCategory(_.filter(response, function (e) {
                return e.categoryId;
            }), 'Dashboard', 'board', 'fa fa-puzzle-piece'), function (e) {
                $scope.resList.push(e);
            })
        });
    };

    var getMenuList = function () {
        return $http.get("commons/getMenuList.do").success(function (response) {
            $scope.menuList = response;
            _.each(response, function (e) {
                $scope.resList.push({
                    id: 'menu_' + e.menuId,
                    text: translate(e.menuName),
                    parent: e.parentId == -1 ? 'Menu' : ('menu_' + e.parentId),
                    resId: e.menuId,
                    type: 'menu', icon: 'fa fa-cog'
                });
            });
        });
    };

    var getDatasourceList = function () {
        return $http.get("dashboard/getDatasourceList.do").success(function (response) {
            _.each(response, function (e) {
                $scope.resList.push({
                    id: 'Datasource_' + e.id, text: e.name, parent: 'Datasource', resId: e.id,
                    type: 'datasource', icon: 'fa fa-database'
                });
            });
        });
    };

    var getDatasetList = function () {
        return $http.get("dashboard/getDatasetList.do").success(function (response) {
            _.each(buildNodeByCategory(response, 'Dataset', 'dataset', 'fa fa-table'), function (e) {
                $scope.resList.push(e);
            });
        });
    };

    var getWidgetList = function () {
        return $http.get("dashboard/getWidgetList.do").success(function (response) {
            _.each(buildNodeByCategory(response, 'Widget', 'widget', 'fa fa-line-chart'), function (e) {
                $scope.resList.push(e);
            });
        });
    };

    var buildNodeByCategory = function (listIn, rParent, type, icon) {
        var newParentId = 1;
        var listOut = [];
        for (var i = 0; i < listIn.length; i++) {
            var arr = listIn[i].categoryName.split('/');
            arr.push(listIn[i].name);
            var parent = rParent;
            for (var j = 0; j < arr.length; j++) {
                var flag = false;
                var a = arr[j];
                for (var m = 0; m < listOut.length; m++) {
                    if (listOut[m].text == a && listOut[m].parent == parent && listOut[m].id.substring(0, 6) == 'parent') {
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    if (j == arr.length - 1) {
                        listOut.push({
                            "id": type + '_' + listIn[i].id.toString(),
                            "parent": parent,
                            "text": a,
                            resId: listIn[i].id,
                            type: type,
                            icon: icon
                        });
                    } else {
                        listOut.push({
                            "id": 'parent' + '_' + type + '_' + newParentId,
                            "parent": parent,
                            "text": a, icon: 'fa fa-fw fa-folder-o',
                            state: {disabled: true}
                        });
                    }
                    parent = 'parent' + '_' + type + '_' + newParentId;
                    newParentId++;
                } else {
                    parent = listOut[m].id;
                }
            }
        }
        return listOut;
    };

    var loadResData = function () {
        getBoardList().then(function () {
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
    }();

    var getRoleResList = function () {
        $http.get("admin/getRoleResList.do").success(function (response) {
            $scope.roleResList = response;
        });
    };
    getRoleResList();

    $scope.changeRoleSelect = function () {
        if ($scope.selectUser && $scope.selectUser.length == 1) {
            var userRole = _.filter($scope.userRoleList, function (e) {
                return e.userId == $scope.selectUser[0].userId;
            });
            $scope.selectRole = _.filter($scope.roleList, function (e) {
                return _.find(userRole, function (ur) {
                    return ur.roleId == e.roleId;
                })
            });
            $scope.changeResSelect();
        }
    };

    $scope.newUser = function () {
        $scope.optFlag = 'newUser';
        $scope.curUser = {};
    };

    $scope.editUser = function (user) {
        $scope.optFlag = 'editUser';
        $scope.curUser = angular.copy(user);
    };

    $scope.newRole = function () {
        $scope.optFlag = 'newRole';
        $scope.curRole = {};
    };

    $scope.editRole = function (role) {
        $scope.optFlag = 'editRole';
        $scope.curRole = angular.copy(role);
    };

    $scope.saveUser = function () {
        // if(!validate()){
        //     return;
        // }
        if ($scope.optFlag == 'newUser') {
            $http.post("admin/saveNewUser.do", {user: angular.toJson($scope.curUser)}).success(function (serviceStatus) {
                if (serviceStatus == '1') {
                    $scope.optFlag = 'none';
                    getUserList();
                    $scope.verify = {dsName: true};
                    ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                } else {
                    $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                }
            });
        } else {
            $http.post("admin/updateUser.do", {user: angular.toJson($scope.curUser)}).success(function (serviceStatus) {
                if (serviceStatus == '1') {
                    $scope.optFlag = 'none';
                    getUserList();
                    $scope.verify = {dsName: true};
                    ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                } else {
                    $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                }
            });
        }

    };

    $scope.saveRole = function () {
        // if(!validate()){
        //     return;
        // }
        if ($scope.optFlag == 'newRole') {
            $http.post("admin/saveRole.do", {role: angular.toJson($scope.curRole)}).success(function (serviceStatus) {
                if (serviceStatus == '1') {
                    $scope.optFlag = 'none';
                    getRoleList();
                    $scope.verify = {dsName: true};
                    ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                } else {
                    $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                }
            });
        } else {
            $http.post("admin/updateRole.do", {role: angular.toJson($scope.curRole)}).success(function (serviceStatus) {
                if (serviceStatus == '1') {
                    $scope.optFlag = 'none';
                    getRoleList();
                    $scope.verify = {dsName: true};
                    ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                } else {
                    $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                }
            });
        }

    };

    $scope.grantRole = function () {
        var userIds = _.map($scope.selectUser, function (e) {
            return e.userId;
        });
        var roleIds = _.map($scope.selectRole, function (e) {
            return e.roleId;
        });
        $http.post("admin/updateUserRole.do", {
            userIdArr: angular.toJson(userIds),
            roleIdArr: angular.toJson(roleIds)
        }).success(function (serviceStatus) {
            if (serviceStatus == '1') {
                $scope.selectUser = null;
                $scope.selectRole = null;
                getUserRoleList();
                ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
            } else {
                $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
            }
        });
    };

    $scope.changeResSelect = function () {
        $scope.optFlag = 'selectRes';
        $scope.treeInstance.jstree(true).open_all();
        if ($scope.selectRole) {
            var roleRes = _.filter($scope.roleResList, function (e) {
                return !_.isUndefined(_.find($scope.selectRole, function (r) {
                    return e.roleId == r.roleId;
                }));
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

    $scope.grantRes = function () {
        var roleIds = _.map($scope.selectRole, function (e) {
            return e.roleId;
        });
        var resIds = _.map(_.filter($scope.treeInstance.jstree(true).get_checked(true), function (e) {
            return !_.isUndefined(e.original.resId);
        }), function (e) {
            return {resId: e.original.resId, resType: e.original.type};
        });
        $http.post("admin/updateRoleRes.do", {
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

    $scope.deleteRole = function () {
        ModalUtils.confirm(translate("COMMON.CONFIRM_DELETE"), "modal-info", "lg", function () {
            $http.post("admin/deleteRole.do", {
                roleId: $scope.selectRole[0].roleId
            }).success(function (serviceStatus) {
                if (serviceStatus == '1') {
                    $scope.selectRole = null;
                    $scope.selectRes = null;
                    getRoleList();
                    getRoleResList();
                    ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                } else {
                    $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                }
            });
        });
    }
});