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
            setPage(1);
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
    $scope.pager = {};
    $scope.setPage = setPage;
    
    
    var pageSizeArr = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 'ALL'];
    $scope.pageSizeArr = pageSizeArr;
    function setPage(page) {
        if (page < 1 || page > $scope.pager.totalPages) {
            return;
        }
        $scope.pager = getPager($scope.categoryList.length, page, $scope.pageSize);
        $scope.finalCategoryList = $scope.categoryList.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);
    }
    
    var changePageSize = function() {
    	if($scope.pageSize == 'ALL')
    		$scope.pageSize = $scope.categoryList.length;
    	$scope.pager = getPager($scope.categoryList.length, 1, $scope.pageSize);
        $scope.finalCategoryList = $scope.categoryList.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);
    }
    $scope.changePageSize = changePageSize;
    
    function getPager(totalItems, currentPage, pageSize) {
        currentPage = currentPage || 1;
        var totalPages = Math.ceil(totalItems / pageSize);
        var startPage, endPage;
        if (totalPages <= 10) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (currentPage + 4 >= totalPages) {
                startPage = totalPages - 9;
                endPage = totalPages;
            } else {
                startPage = currentPage - 5;
                endPage = currentPage + 4;
            }
        }
        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
        var pages = _.range(startPage, endPage + 1);
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }
});