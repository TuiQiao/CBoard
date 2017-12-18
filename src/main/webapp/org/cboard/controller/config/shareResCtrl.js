/**
 * Created by yfyuan on 2017/04/10.
 */
cBoard.controller('shareResCtrl', function ($scope, $http, ModalUtils, $filter) {

    var translate = $filter('translate');
    $scope.curUser;
    $scope.userKeyword = '';
    $scope.folderIds = [];

    var getRoleList = function () {
        $http.get("admin/getRoleListAll.do").success(function (response) {
            $scope.roleList = response;
        });
    };
    getRoleList();

    $scope.resList = [{
        id: '10000',
        text: translate('CONFIG.SHARE_RES.YOUR_RES'),
        parent: '#',
        icon: 'fa fa-dashboard fa-lg',
        state: {
            disabled: true
        }
    }];

    var getFolderList = function () {
        return $http.post('dashboard/getFolderFamilyTree.do', {folderIds: angular.toJson($scope.folderIds)}).success(function (response) {
            $scope.folderList = response;


            for (var i = 0; i < $scope.folderList.length; i++) {
                if ($scope.folderList[i].parentId != -1 && $scope.folderList[i].isPrivate != 1) {
                    // var folderName = $scope.folderList[i].name;
                    $scope.resList.push({
                        "id": $scope.folderList[i].id,
                        "parent": $scope.folderList[i].parentId,
                        "text":  $scope.folderList[i].name,
                        resId: $scope.folderList[i].id,
                        type: "folder"
                    });
                }
            }
        });
    };

    var getBoardList = function () {
        return $http.get("dashboard/getBoardList.do").success(function (response) {
            _.each(buildNodeByCategory(_.filter(response, function (e) {
                return e.folderId;
            }), 'Dashboard', 'board', 'fa fa-puzzle-piece'), function (e) {
                $scope.resList.push(e);
            });

            $scope.folderIds = _.union($scope.folderIds, response.map(function (item) {
                return item.folderId;
            }));
        });
    };

    var getDatasetList = function () {
        return $http.get("dashboard/getDatasetList.do").success(function (response) {
            _.each(buildNodeByCategory(response, 'Dataset', 'dataset', 'fa fa-table'), function (e) {
                $scope.resList.push(e);
            });

            $scope.folderIds = _.union($scope.folderIds, response.map(function (item) {
                return item.folderId;
            }));
        });
    };

    var getWidgetList = function () {
        return $http.get("dashboard/getWidgetList.do").success(function (response) {
            _.each(buildNodeByCategory(response, 'Widget', 'widget', 'fa fa-line-chart'), function (e) {
                $scope.resList.push(e);
            });

            $scope.folderIds = _.union($scope.folderIds, response.map(function (item) {
                return item.folderId;
            }));
        });
    };

    var buildNodeByCategory = function (listIn, rParent, type, icon) {
        var listOut = [];

        for (var i = 0; i < listIn.length; i++) {
            if (listIn[i].folderIsPrivate != undefined && listIn[i].folderIsPrivate == 1)
                continue;
            listOut.push({
                "id": type + listIn[i].id.toString(),
                "parent": listIn[i].folderId,
                "text": listIn[i].name.toString(),
                resId: listIn[i].id,
                type: type,
                icon: icon,
                name: listIn[i].name
            });
        }
        return listOut;
    };

    var loadResData = function () {
        getBoardList().then(function () {
            return getDatasetList();
        }).then(function () {
            return getWidgetList();
        }).then(function () {
            return getFolderList();
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
                $scope.treeInstance.jstree(true).open_all();
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
            return e.original.resId;
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