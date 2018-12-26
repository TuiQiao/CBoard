/**
 * Created by yfyuan on 2016/8/2.
 */
'use strict';
cBoard.controller('homepageSettingCtrl',
    function ($rootScope, $scope, $http, ModalUtils, $filter, updateService, $uibModal,
              $timeout, dataService, $state, $window, $stateParams) {
        var translate = $filter('translate');

        $scope.optFlag = 'none';
        $scope.curBoard = {layout: {rows: []}};
        $scope.alerts = [];
        $scope.verify = {boardName: true};
        $rootScope.freeLayout = false;
        $scope.treeData = [];

        var treeID = "boardTreeID";
        var originalData = [];
        var updateUrl = "dashboard/updateBoard.do";

        var getBoardList = function () {
            return $http.get("dashboard/getBoardList.do").success(function (response) {
                $scope.boardList = response;
                originalData = jstree_CvtVPath2TreeData(
                    $scope.boardList.map(function (ds) {
                        var categoryName = ds.categoryName == null ? translate('CONFIG.DASHBOARD.MY_DASHBOARD') : ds.categoryName;
                        return {
                            "id": ds.id,
                            "name": ds.name,
                            "categoryName": categoryName
                        };
                    })
                );
                jstree_ReloadTree(treeID, originalData);
                $timeout(function() {
                	$('#saveHomepage').removeClass('disabled');
                	$('#resetHomepage').removeClass('disabled');                	
                	$scope.treeInstance.jstree(true).open_all();                	
                	$http.get("homepage/selectHomepage.do").success(function (response) {
                		if(response != null) {
                			$("#"+response+"_anchor").css("font-weight","bold");
                		}                		
                     });
                }, 500);                
            });
        };

        var getCategoryList = function () {
            $http.get("dashboard/getCategoryList.do").success(function (response) {
                $scope.categoryList = [{id: null, name: translate('CONFIG.DASHBOARD.MY_DASHBOARD')}];
                _.each(response, function (o) {
                    $scope.categoryList.push(o);
                });
            });
        };

        var boardChange = function () {
            $scope.verify = {boardName: true};
            $scope.$emit("boardChange");
        };

        $('#saveHomepage').addClass('disabled');
        $('#resetHomepage').addClass('disabled');
        var boardListPromise = getBoardList();
        getCategoryList();
        
        $scope.resetHomepage = function () {
        	if(!$('#resetHomepage').hasClass('disabled')) {
        		ModalUtils.confirm(translate("COMMON.CONFIRM_RESET"), "modal-warning", "lg", function () {
        			$http.post("homepage/resetHomepage.do", {}).success(function (serviceStatus) {
                        if (serviceStatus.status == '1') {
                        	$(".jstree-anchor").css("font-weight", "");
                            ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                        } else {
                        	ModalUtils.alert(translate("COMMON.FAIL"), "modal-danger", "sm");
                        }
                    });
        		});
        	}
        };

        $scope.saveHomepage = function () {
        	if(!$('#saveHomepage').hasClass('disabled')) {
        		var board = getSelectedBoard();
            	if(board == null) {
            		ModalUtils.alert(translate("COMMON.MUST_SELECT_ONE_BOARD"), "modal-warning", "sm");
            	} else {            		
            		$http.post("homepage/saveHomepage.do", {
                        boardId: board.id,
                    }).success(function (serviceStatus) {
                        if (serviceStatus.status == '1') {
                        	$(".jstree-anchor").css("font-weight", "");
                        	$("#"+board.id+"_anchor").css("font-weight","bold");
                            ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                        } else {
                        	ModalUtils.alert(translate("COMMON.FAIL"), "modal-danger", "sm");
                        }
                    });
            	}       
        	}
        };

        /**  js tree related start **/
        $scope.treeConfig = angular.copy(jsTreeConfig1);
        $scope.treeConfig.plugins = ['types', 'unique', 'state', 'sort'];

        $("#" + treeID).keyup(function (e) {
            if (e.keyCode == 46) {
                $scope.deleteBoard(getSelectedBoard());
            }
        });

        var getSelectedBoard = function () {
            var selectedNode = jstree_GetSelectedNodes(treeID)[0];
            if(selectedNode == null) {
            	return null;
            }
            return _.find($scope.boardList, function (ds) {
                return ds.id == selectedNode.id;
            });
        };
        
    });
