/**
 * Created by yfyuan on 2016/8/29.
 */
cBoard.controller('categoryCtrl', function ($scope, $http, ModalUtils) {

    $scope.optFlag = 'none';
    $scope.categoryList = {};

    var getCategoryList = function () {
        $http.get("/dashboard/getCategoryList.do").success(function (response) {
            $scope.categoryList = response;
        });
    };

    var categoryChange = function () {
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
        ModalUtils.confirm("确认删除吗？", "modal-warning", "lg", function () {
            $http.post("/dashboard/deleteCategory.do", {id: ds.id}).success(function () {
                $scope.optFlag = 'none';
                getCategoryList();
                categoryChange();
            });
        });
    };

    $scope.save = function () {
        if ($scope.optFlag == "new") {
            $http.post("/dashboard/saveNewCategory.do", {json: angular.toJson($scope.curCategory)}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    $scope.optFlag = 'none';
                    getCategoryList();
                    ModalUtils.alert("成功", "modal-success", "sm");
                    categoryChange();
                } else {
                    ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                }
            });
        } else {
            $http.post("/dashboard/updateCategory.do", {json: angular.toJson($scope.curCategory)}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    $scope.optFlag = 'none';
                    getCategoryList();
                    ModalUtils.alert("成功", "modal-success", "sm");
                    categoryChange();
                } else {
                    ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                }
            });
        }

    };

});