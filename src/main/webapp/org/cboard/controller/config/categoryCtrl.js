/**
 * Created by yfyuan on 2016/8/29.
 */
cBoard.controller('categoryCtrl', function ($scope, $http, ModalUtils, $filter,$uibModal) {

    var translate = $filter('translate');
    $scope.optFlag = 'none';
    $scope.categoryList = {};
    $scope.alerts = [];
    $scope.verify = {categoryName:true};
    $scope.colorArray = ['#5d9fe6','#9fc173','#a789c7','#e88b8a','#f5d451','#ecb44d','#aee8f4','#7272af','#7c8798',
        '#90c3c6','#bc7676','#8b9bc7','#c189ba','#bb8cf2'];

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
        $uibModal.open({
            templateUrl: 'org/cboard/view/config/dashBoardCategory/new.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'lg',
            scope: $scope,
            controller: ('categoryCtrl',function ($scope, $uibModalInstance) {
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.save = function() {
                    save();
                    $uibModalInstance.close();
                }
            })

        });
    };
    $scope.editBordCategory = function (ds) {
        $scope.optFlag = 'edit';
        $scope.curCategory = angular.copy(ds);
        $uibModal.open({
            templateUrl: 'org/cboard/view/config/dashBoardCategory/edit.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'lg',
            scope: $scope,
            controller: ('categoryCtrl',function ($scope, $uibModalInstance) {
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.save = function() {
                    save();
                    $uibModalInstance.close();
                }
            })

        });
    };
    $scope.deleteBordCategory = function (ds) {
        ModalUtils.confirm(translate('COMMON.CONFIRM_DELETE')+ds.name, 'modal-warning', 'lg', function () {
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

    var save = function () {
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

    /*
     * Code for pagination
     */
    $scope.pageSize = 10;
    $scope.currentPage = 1;

    var pageSizeArr = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 'ALL'];
    $scope.pageSizeArr = pageSizeArr;
    var changePageSize = function(pagesize) {
        if($scope.pageSize == 'ALL') {
            $scope.pageSize = $scope.categoryList.length;
        }
        else {
            $scope.pageSize = pagesize;
        }
    }
    $scope.changePageSize = changePageSize;


});