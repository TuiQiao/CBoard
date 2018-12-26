/**
 * Created by yfyuan on 2017/04/10.
 */
cBoard.controller('shareResCtrl', function ($scope, $http, ModalUtils, $filter) {

    var translate = $filter('translate');
    $scope.curUser;
    $scope.userKeyword = '';

    var getRoleList = function () {
        $http.get("admin/getRoleListAll.do").success(function (response) {
            $scope.roleList = response;
        });
    };
    getRoleList();

    $scope.resList = [{
        id: 'Dashboard',
        text: translate('ADMIN.BOARD'),
        parent: '#',
        icon: 'fa fa-dashboard fa-lg',
        state: {
            disabled: true
        }
    }, {
        id: 'Dataset',
        text: translate('ADMIN.DATASET'),
        parent: '#',
        icon: 'fa fa-cubes fa-lg',
        state: {
            disabled: true
        }
    }, {
        id: 'Widget',
        text: translate('ADMIN.WIDGET'),
        parent: '#',
        icon: 'fa fa-bar-chart-o fa-lg',
        state: {
            disabled: true
        }
    }];

    var getBoardList = function () {
        return $http.get("admin/getBoardListUser.do").success(function (response) {
            _.each(buildNodeByCategory(_.filter(response, function (e) {
                return e.categoryId;
            }), 'Dashboard', 'board', 'fa fa-puzzle-piece'), function (e) {
                $scope.resList.push(e);
            })
        });
    };

    var getDatasetList = function () {
        return $http.get("admin/getDatasetListUser.do").success(function (response) {
            _.each(buildNodeByCategory(response, 'Dataset', 'dataset', 'fa fa-table'), function (e) {
                $scope.resList.push(e);
            });
        });
    };

    var getWidgetList = function () {
        return $http.get("admin/getWidgetListUser.do").success(function (response) {
            _.each(buildNodeByCategory(response, 'Widget', 'widget', 'fa fa-line-chart'), function (e) {
                $scope.resList.push(e);
            });
        });
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
                            "text": a,
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
                            /*icon: 'fa fa-fw fa-folder-o',*/
                            //,state: {disabled: true}
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
                    three_state: true
                },
                version: 1,
                plugins: ['types', 'checkbox', 'unique']
            };
            _.delay(function () {
                $scope.treeInstance.jstree(true);
            }, 500);
        });
    }();


    var getRoleResList = function () {
        $http.get("admin/getRoleResList.do").success(function (response) {
            $scope.roleResList = response;
        });
    };
    getRoleResList();


    $scope.grantRes = function () {
        var roleIds = _.map($scope.selectRole, function (e) {
            return e.roleId;
        });
        var resIds = _.map(_.filter($scope.treeInstance.jstree(true).get_selected(true), function (e) {
            return !_.isUndefined(e.original.resId);
        }), function (e) {
            return {
                resId: e.original.resId,
                resType: e.original.type,
            };
        });
        $http.post("admin/updateRoleResUser.do", {
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

    $scope.changed = function (node, action, selected) {
        var node = action.node.original;

        var roleIds = _.map(_.filter($scope.roleResList, function (e) {
            return e.resType == node.type && e.resId == node.resId;
        }), function (e) {
            return e.roleId;
        });
        $scope.selectRole = _.filter($scope.roleList, function (e) {
            return _.find(roleIds, function (r) {
                return e.roleId == r;
            })
        });
    };

    $scope.jstree_open_all = function () {
        $scope.treeInstance.jstree(true).open_all();
    };
    
    $scope.jstree_close_all = function () {
        $scope.treeInstance.jstree(true).close_all();
    }
});