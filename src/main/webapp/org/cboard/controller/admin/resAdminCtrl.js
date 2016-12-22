/**
 * Created by yfyuan on 2016/12/7.
 */
cBoard.controller('resAdminCtrl', function ($scope, $http, ModalUtils, $filter) {
    var translate = $filter('translate');

    $scope.resTypeList = [{name: '看板', value: 'board'},{name: '菜单', value: 'menu'}];

    var getRoleList = function () {
        $http.get("/admin/getRoleList.do").success(function (response) {
            $scope.roleList = response;
        });
    };
    getRoleList();

    var getBoardList = function () {
        $http.get("/dashboard/getBoardList.do").success(function (response) {
            $scope.boardList = response;
        });
    };
    getBoardList();

    var getMenuList = function () {
        $http.get("/commons/getMenuList.do").success(function (response) {
            $scope.menuList = response;
        });
    };
    getMenuList();

    var getRoleResList = function () {
        $http.get("/admin/getRoleResList.do").success(function (response) {
            $scope.roleResList = response;
        });
    };
    getRoleResList();

    $scope.getResList = function () {
        switch ($scope.resType) {
            case 'board':
                $scope.resList = _.map(_.filter($scope.boardList, function (e) {
                    return e.categoryId;
                }), function (e) {
                    return {id: e.id, name: e.name};
                });
                break;
            case 'menu':
                $scope.resList = _.map($scope.menuList, function (e) {
                    return {id: e.menuId, name: e.menuName};
                });
                break;
        }
        $scope.changeResSelect();
    };

    $scope.changeResSelect = function () {
        if ($scope.selectRole && $scope.selectRole.length == 1) {
            var roleRes = _.filter($scope.roleResList, function (e) {
                return e.roleId == $scope.selectRole[0].roleId && e.resType == $scope.resType;
            });
            $scope.selectRes = _.filter($scope.resList, function (e) {
                return _.find(roleRes, function (rr) {
                    return rr.resId == e.id;
                })
            });
        }
    };

    $scope.grant = function () {
        var roleIds = _.map($scope.selectRole, function (e) {
            return e.roleId;
        });
        var resIds = _.map($scope.selectRes, function (e) {
            return e.id;
        });
        $http.post("/admin/updateRoleRes.do", {
            roleIdArr: angular.toJson(roleIds),
            resIdArr: angular.toJson(resIds),
            resType: $scope.resType
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