/**
 * Created by yfyuan on 2016/12/5.
 */
cBoard.controller('userAdminCtrl', function ($scope, $http, ModalUtils, $filter) {

    var translate = $filter('translate');
    $scope.optFlag;
    $scope.curUser;
    $scope.filterByRole = false;
    $scope.userKeyword = '';

    $scope.tab = 'menu';

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

    $scope.tree = {menu: {}, board: {}, datasource: {}, dataset: {}, widget: {}, job: {}};
    $scope.tree.menu.resList = [{
        id: 'Menu',
        text: translate('ADMIN.MENU'),
        parent: '#',
        /*icon: 'fa fa-fw fa-folder-o',*/
        state: {disabled: true}
    }];
    $scope.tree.board.resList = [{
        id: 'Dashboard',
        text: translate('ADMIN.BOARD'),
        parent: '#',
        /*icon: 'fa fa-fw fa-folder-o',*/
        state: {disabled: true}
    }];
    $scope.tree.datasource.resList = [{
        id: 'Datasource',
        text: translate('ADMIN.DATASOURCE'),
        parent: '#',
        /*icon: 'fa fa-fw fa-folder-o',*/
        state: {disabled: true}
    }];
    $scope.tree.dataset.resList = [{
        id: 'Dataset', text: translate('ADMIN.DATASET'), parent: '#',
        /*icon: 'fa fa-fw fa-folder-o',*/
        state: {disabled: true}
    }];
    $scope.tree.widget.resList = [{
        id: 'Widget',
        text: translate('ADMIN.WIDGET'),
        parent: '#',
        /*icon: 'fa fa-fw fa-folder-o',*/
        state: {disabled: true}
    }];
    $scope.tree.job.resList = [{
        id: 'Job',
        text: translate('ADMIN.JOB'),
        parent: '#',
        /*icon: 'fa fa-fw fa-folder-o',*/
        state: {disabled: true}
    }];

    var getBoardList = function () {
        return $http.get("admin/getBoardList.do").success(function (response) {
            _.each(buildNodeByCategory(_.filter(response, function (e) {
                return e.categoryId;
            }), 'Dashboard', 'board', 'fa fa-puzzle-piece'), function (e) {
                $scope.tree.board.resList.push(e);
            })
        });
    };

    var getMenuList = function () {
        return $http.get("admin/getMenuList.do").success(function (response) {
            $scope.menuList = response;
            _.each(response, function (e) {
                $scope.tree.menu.resList.push({
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
        return $http.get("admin/getDatasourceList.do").success(function (response) {
            _.each(buildNodeByCategory(response, 'Datasource', 'datasource', 'fa fa-database'), function (e) {
                $scope.tree.datasource.resList.push(e);
            });
        });
    };

    var getDatasetList = function () {
        return $http.get("admin/getDatasetList.do").success(function (response) {
            _.each(buildNodeByCategory(response, 'Dataset', 'dataset', 'fa fa-table'), function (e) {
                $scope.tree.dataset.resList.push(e);
            });
        });
    };

    var getWidgetList = function () {
        return $http.get("admin/getWidgetList.do").success(function (response) {
            _.each(buildNodeByCategory(response, 'Widget', 'widget', 'fa fa-line-chart'), function (e) {
                $scope.tree.widget.resList.push(e);
            });
        });
    };

    var getJobList = function () {
        return $http.get("admin/getJobList.do").success(function (response) {
            _.each(buildNodeByCategory(response, 'Job', 'job', 'fa fa-clock-o'), function (e) {
                $scope.tree.job.resList.push(e);
            });
        });
    };

    var getCUDRlabel = function (e, d) {
        var a = ['R'];
        if (e) {
            a.push('U');
        }
        if (d) {
            a.push('D');
        }
        return ' (' + a.join(',') + ')';
    };

    var buildNodeByCategory = function (listIn, rParent, type, icon) {
        var newParentId = 1;
        var listOut = [];
        for (var i = 0; i < listIn.length; i++) {
            var arr = [];
            if (listIn[i].categoryName) {
                arr = listIn[i].categoryName.split('/');
                arr.push(listIn[i].name);
            } else {
                arr.push(listIn[i].name);
            }
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
                            "text": a,//+ getCUDRlabel(true, true),
                            resId: listIn[i].id,
                            type: type,
                            icon: icon,
                            name: a
                        });
                    } else {
                        listOut.push({
                            "id": 'parent' + '_' + type + '_' + newParentId,
                            "parent": parent,
                            "text": a
                            /*icon: 'fa fa-fw fa-folder-o'*/
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

    var getContextMenu = function ($node) {
        function toggleACL(attr) {
            return function(obj) {
                $node.original[attr] = $node.original[attr] == undefined ? false : !$node.original[attr];
                _.each($node.children_d, function (e) {
                    var tree = $(obj.reference).jstree(true);
                    var node = tree.get_node(e);
                    if (node.children.length == 0) {
                        node.original[attr] = $node.original[attr];
                        tree.rename_node(node, node.original.name + getCUDRlabel(node.original[attr], node.original.delete));
                    }
                });
            }
        }

        if (_.isUndefined($node.original.resId)) {
            if ($node.parent != '#') {
                return {
                    edit: {
                        label: function () {
                            return translate('ADMIN.TOGGLE_UPDATE');
                        },
                        action: toggleACL('update')
                    },
                    delete: {
                        label: function () {
                            return translate('ADMIN.TOGGLE_DELETE');
                        },
                        action: toggleACL('delete')
                    }
                };
            } else {
                return;
            }
        } else {
            return {
                edit: {
                    label: function () {
                        return $node.original.edit ? '√ Update' : '× Update';
                    },
                    action: function (obj) {
                        $node.original.edit = !$node.original.edit;
                        $(obj.reference).jstree(true).rename_node($node, $node.original.name + getCUDRlabel($node.original.edit, $node.original.delete));
                    }
                },
                delete: {
                    label: function () {
                        return $node.original.delete ? '√ Delete' : '× Delete';
                    },
                    action: function (obj) {
                        $node.original.delete = !$node.original.delete;
                        $(obj.reference).jstree(true).rename_node($node, $node.original.name + getCUDRlabel($node.original.edit, $node.original.delete));
                    }
                }
            };
        }
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
            return getJobList();
        }).then(function () {
            var config = {
                core: {
                    multiple: true,
                    animation: true,
                    error: function (error) {
                    },
                    check_callback: true,
                    worker: true
                },
                checkbox: {
                    three_state: true
                },
                contextmenu: {
                    items: getContextMenu,
                    select_node: false
                },
                version: 1,
                plugins: ['types', 'checkbox', 'unique', 'contextmenu']
            };
            var configMenu = angular.copy(config);
            configMenu.checkbox.three_state = false;
            delete configMenu.contextmenu;
            configMenu.plugins = ['types', 'checkbox', 'unique'];
            $scope.treeConfig = config;
            $scope.treeMenuConfig = configMenu;
        });
    }();


    var getRoleResList = function () {
        $http.get("admin/getRoleResList.do").success(function (response) {
            $scope.roleResList = response;
        });
    };
    getRoleResList();

    $scope.onRoleFilter = function (item) {
        $scope.roleFilter = _.map(_.filter($scope.userRoleList, function (e) {
            return e.roleId == item.roleId;
        }), function (u) {
            return u.userId;
        });
    };

    $scope.searchUserByRole = function (user) {
        if (!$scope.filterByRole) {
            return true;
        }
        return !_.isUndefined(_.find($scope.roleFilter, function (e) {
            return e == user.userId;
        }))
    };

    $scope.searchUserByName = function (user) {
        if ($scope.userKeyword === "" || $scope.userKeyword === undefined) return true;
        if (!$scope.filterByRole) {
            return (user.loginName + user.userName).toLowerCase().indexOf($scope.userKeyword) != -1;
        } else {
            return false;
        }
    };

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

    $scope.revokeRole = function () {
        var userIds = _.map($scope.selectUser, function (e) {
            return e.userId;
        });
        var roleIds = _.map($scope.selectRole, function (e) {
            return e.roleId;
        });
        $http.post("admin/deleteUserRole.do", {
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
        changeResSelectByTree($scope.tree.menu);
        changeResSelectByTree($scope.tree.board);
        changeResSelectByTree($scope.tree.dataset);
        changeResSelectByTree($scope.tree.datasource);
        changeResSelectByTree($scope.tree.job);
        changeResSelectByTree($scope.tree.widget);
    };

    var changeResSelectByTree = function (tree) {
        $scope.optFlag = 'selectRes';
        tree.treeInstance.jstree(true).open_all();
        if ($scope.selectRole) {
            var roleRes = _.filter($scope.roleResList, function (e) {
                return !_.isUndefined(_.find($scope.selectRole, function (r) {
                    return e.roleId == r.roleId;
                }));
            });
            tree.treeInstance.jstree(true).uncheck_all();
            _.each(tree.resList, function (e) {
                var f = _.find(roleRes, function (rr) {
                    return rr.resId == e.resId && rr.resType == e.type;
                });
                var _n = tree.treeInstance.jstree(true).get_node(e);
                if (!_.isUndefined(f)) {
                    tree.treeInstance.jstree(true).check_node(e);
                    if (e.name) { //菜单节点不需要更新权限标记
                        _n.original.edit = f.edit;
                        _n.original.delete = f.delete;
                    }
                } else {
                    if (e.name) { //菜单节点不需要更新权限标记
                        _n.original.edit = true;
                        _n.original.delete = true;
                    }
                }
                if (e.name) {
                    tree.treeInstance.jstree(true).rename_node(e, e.name + getCUDRlabel(_n.original.edit, _n.original.delete));
                }
            });
        }
    };

    $scope.grantRes = function () {
        var roleIds = _.map($scope.selectRole, function (e) {
            return e.roleId;
        });
        var resIds = [];
        for (var key in $scope.tree) {
            _.each(_.filter($scope.tree[key].treeInstance.jstree(true).get_checked(true), function (e) {
                return !_.isUndefined(e.original.resId);
            }), function (e) {
                resIds.push({
                    resId: e.original.resId,
                    resType: e.original.type,
                    edit: e.original.edit,
                    delete: e.original.delete
                });
            });
        }
        $http.post("admin/updateRoleRes.do", {
            roleIdArr: angular.toJson(roleIds),
            resIdArr: angular.toJson(resIds)
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

    $scope.deleteUser = function () {
        ModalUtils.confirm(translate("COMMON.CONFIRM_DELETE"), "modal-info", "lg", function () {
            $http.post("admin/deleteUser.do", {
                userId: $scope.selectUser[0].userId
            }).success(function (serviceStatus) {
                if (serviceStatus == '1') {
                    $scope.selectUser = null;
                    getUserList();
                    ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                } else {
                    $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                }
            });
        });
    }
});