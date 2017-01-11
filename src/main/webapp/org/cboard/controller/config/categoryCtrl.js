/**
 * Created by yfyuan on 2016/8/29.
 */
cBoard.controller('categoryCtrl', function ($scope, $http, ModalUtils, $filter) {

    var translate = $filter('translate');
    $scope.optFlag = 'none';
    $scope.categoryList = {};
    $scope.alerts = [];
    $scope.verify = {categoryName:true};

    var getCategoryList = function () {
        $http.get("dashboard/getCategoryList.do").success(function (response) {
            $scope.categoryList = response;
        });
    };

    var categoryChange = function () {
        $scope.verify = {categoryName:true};
        $scope.$emit("categoryChange");
    };

    getCategoryList();

    $scope.newBordCategory = function () {
        $scope.optFlag = 'new';
        $scope.curCategory = {};
    };
    $scope.editBordCategory = function (ds) {
        $scope.optFlag = 'edit';
        $scope.curCategory = angular.copy(ds);
    };
    $scope.deleteBordCategory = function (ds) {
        ModalUtils.confirm(translate("COMMON.CONFIRM_DELETE"), "modal-warning", "lg", function () {
            $http.post("dashboard/deleteCategory.do", {id: ds.id}).success(function () {
                $scope.optFlag = 'none';
                getCategoryList();
                categoryChange();
            });
        });
    };

    var validate = function () {
        $scope.alerts = [];
        if(!$scope.curCategory.name){
            $scope.alerts = [{msg: translate('CONFIG.CATEGORY.NAME')+translate('COMMON.NOT_EMPTY'), type: 'danger'}];
            $scope.verify = {categoryName : false};
            $("#CategoryName").focus();
            return false;
        }
        return true;
    }

    $scope.save = function () {
        if(!validate()){
            return;
        }
        if ($scope.optFlag == "new") {
            $http.post("dashboard/saveNewCategory.do", {json: angular.toJson($scope.curCategory)}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    $scope.optFlag = 'none';
                    getCategoryList();
                    ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                    categoryChange();
                } else {
                    $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                }
            });
        } else {
            $http.post("dashboard/updateCategory.do", {json: angular.toJson($scope.curCategory)}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    $scope.optFlag = 'none';
                    getCategoryList();
                    ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                    categoryChange();
                } else {
                    $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                }
            });
        }

    };

});