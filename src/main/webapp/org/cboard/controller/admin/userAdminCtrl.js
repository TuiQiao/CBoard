

/**
 * Created by yfyuan on 2016/12/5.
 */
 cBoard.controller('userAdminCtrl', function ($scope, $http, ModalUtils, $filter,$uibModal) {
	
	$scope.readyCB = function() {
    };

    $scope.choosenRole = {};
    $scope.role = {selected : ""};

    var translate = $filter('translate');
    $scope.optFlag;
    $scope.curUser;
    $scope.filterByRole = false;
    $scope.userKeyword = '';
    $scope.dashboardData1 = [];
    $scope.tab = 'menu';
    
    //colorArray declared here
    $scope.colorArray = ['#5d9fe6','#9fc173','#a789c7','#e88b8a','#f5d451','#ecb44d','#aee8f4','#7272af','#7c8798',
        					'#90c3c6','#bc7676','#8b9bc7','#c189ba','#bb8cf2'];
    
    $http.get("admin/isAdmin.do").success(function (response) {
        $scope.isAdmin = response;
    });

    var getUserList = function () {
        $http.get("admin/getUserList.do").success(function (response) {
            $scope.userList = response;
            setPageForUser(1);
        });
    };
    getUserList();

    var getRoleList = function () {
        $http.get("admin/getRoleList.do").success(function (response) {
            $scope.roleList = response;
            setPageForRole(1);
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

    $scope.boardListArr = [];
    $scope.boardListInMultiselect = [];
    var getBoardList = function () {
        return $http.get("admin/getBoardList.do").success(function (response) {
        	 $scope.boardList = response;
        	 _.each(response, function (e) {
                 if(e.parentId != -1 ){
              	   $scope.boardListArr.push(e);
                 }
              });
        	 _.each($scope.boardList, function (e) {
                 $scope.tree.board.resList.push({
                     id: e.id,
                     text: translate(e.name),                 
                     resId: e.id,
                     type: 'board'
                  });
              });
        	 _.each($scope.tree.board.resList, function (f) {
                 if(f.id != 'Dashboard')
                 	{
                 		$scope.boardListInMultiselect.push(f);
                 	}
              });
        });
    };
    
    $scope.menuListArr = [];
    $scope.menuListInMultiselect = [];
    var getMenuList = function () {
        return $http.get("admin/getMenuList.do").success(function (response) {
            $scope.menuList = response;
            _.each(response, function (e) {
                if(e.parentId != -1 ){
             	   $scope.menuListArr.push(e);
                }
             });
            
           _.each($scope.menuListArr, function (e) {
               $scope.tree.menu.resList.push({
                   id: e.menuId,
                   text: translate(e.menuName),                  
                    parent: e.parentId == -1 ? 'Menu' : ('menu_' + e.parentId),
                    resId: e.menuId,
                    type: 'menu', icon: 'fa fa-cog'
                });
            });
          
           _.each($scope.tree.menu.resList, function (f) {
               if(f.id != 'Menu')
               	{
               		$scope.menuListInMultiselect.push(f);
               	}
            });
        });
    };
    
    $scope.datasourceListArr = [];
    $scope.datasourceListInMultiselect = [];
    var getDatasourceList = function () {
        return $http.get("admin/getDatasourceList.do").success(function (response) {
        	$scope.dataSourceList = response;
        	_.each(response, function (e) {
                if(e.parentId != -1 ){
             	   $scope.datasourceListArr.push(e);
                }
             });
        	 _.each($scope.dataSourceList, function (e) {
        		 $scope.tree.datasource.resList.push({
                     id: e.id,
                     text: translate(e.name),                 
                     resId: e.id,
                     type: 'datasource'
                  });
              });
        	 _.each($scope.tree.datasource.resList, function (f) {
                 if(f.id != 'Datasource')
                 	{
                 		$scope.datasourceListInMultiselect.push(f);
                 	}
              });
        });
    };

    $scope.datasetListArr = [];
    $scope.datasetListInMultiselect = [];
    var getDatasetList = function () {
        return $http.get("admin/getDatasetList.do").success(function (response) {
        	$scope.datasetList = response;
        	_.each(response, function (e) {
                if(e.parentId != -1 ){
             	   $scope.datasetListArr.push(e);
                }
             });
        	
       	 	_.each($scope.datasetList, function (e) {
       		 $scope.tree.dataset.resList.push({
                    id: e.id,
                    text: translate(e.name),
                    resId: e.id,
                    type: 'dataset'
                 });
             });
       	 	
	       	 _.each($scope.tree.dataset.resList, function (f) {
	             if(f.id != 'Dataset')
	             	{
	             		$scope.datasetListInMultiselect.push(f);
	             	}
	          });
        });
    };

    $scope.widgetListArr = [];
    $scope.widgetListInMultiselect = [];
    var getWidgetList = function () {
        return $http.get("admin/getWidgetList.do").success(function (response) {
        	$scope.widgetList = response;
        	_.each(response, function (e) {
                if(e.parentId != -1 ){
             	   $scope.datasetListArr.push(e);
                }
             });
        	
       	 	_.each($scope.widgetList, function (e) {
       		 $scope.tree.widget.resList.push({
                    id: e.id,
                    text: translate(e.name),
                    resId: e.id,
                    type: 'widget'
                 });
             });
       	 	
	       	 _.each($scope.tree.widget.resList, function (f) {
	             if(f.id != 'Widget')
	             	{
	             		$scope.widgetListInMultiselect.push(f);
	             	}
	          });
        });
    };

    $scope.jobListArr = [];
    $scope.jobListinMultiselect = [];
    var getJobList = function () {
        return $http.get("admin/getJobList.do").success(function (response) {
        	$scope.jobList = response;
        	_.each(response, function (e) {
                if(e.parentId != -1 ){
             	   $scope.jobListArr.push(e);
                }
             });
        	
       	 	_.each($scope.jobList, function (e) {
       		 $scope.tree.job.resList.push({
                    id: e.id,
                    text: translate(e.name),
                    resId: e.id,
                    type: 'job'
                 });
             });
       	 	
	       	 _.each($scope.tree.job.resList, function (f) {
	             if(f.id != 'Job')
	             	{
	             		$scope.jobListinMultiselect.push(f);
	             	}
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
    	$uibModal.open({
            templateUrl: 'org/cboard/view/admin/modal/newUser.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'lg',
            scope: $scope,
            controller: ('userAdminCtrl',function ($scope, $uibModalInstance) {
            	$scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.saveUser = function() {
                	saveUser();
                	$uibModalInstance.close();
 				}
            })
        });
    };
    
    $scope.reqRole = {};
    $scope.getRoleForParticularUser = function(userObj){
    	$http.get("admin/getUserRoleList.do").success(function (response) {
    		$scope.userRoleList = response;
    	 }); 
         $scope.userRoleList.forEach(function(element) {
        	 if(element.userId == userObj.userId ){
        		 $scope.reqRole.roleId = element.roleId;
               }
         });
    };

    $scope.editUser = function (user) {
        $scope.optFlag = 'editUser';
        $scope.curUser = angular.copy(user);
        $uibModal.open({
            templateUrl: 'org/cboard/view/admin/modal/editUser.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'lg',
            scope: $scope,
            controller: ('userAdminCtrl',function ($scope, $uibModalInstance) {
        		$scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.saveUser = function() {
                	saveUser();
                	$uibModalInstance.close();
 				}
            })
            
        });
    };

    var storeRolIdToUpdate;
    var saveUser = function () {
        // if(!validate()){
        //     return;
        // }
        if ($scope.optFlag == 'newUser') {
            $http.post("admin/saveNewUser.do", {user: angular.toJson($scope.curUser)}).success(function (serviceStatus) {
                if (serviceStatus == '1') {
                    $scope.optFlag = 'none';
                    $http.get("admin/getUserList.do").success(function (response) {
                        $scope.userList = response;
                        var filterUserObj = $scope.userList.filter(data=> {
                            if(data.loginName  == $scope.curUser.loginName && data.userName == $scope.curUser.userName) {
                                return true;
                            } else {
                                return false;
                            }
                        });
                        var reqUser = {};
                        // to avoid duplicacy
                          if(filterUserObj instanceof Array) {
                          	reqUser = filterUserObj[0];
                          }else {
                          	reqUser = filterUserObj;
                          }
                          reqUser.roleId = $scope.curUser.roleId;
                          grantRole(reqUser);
                       });
                    
                    $scope.verify = {dsName: true};
                    getUserList();
                    
                    var filterUserObj = $scope.userList.filter(data=> {
                        if(data.loginName  == $scope.curUser.loginName && data.userName == $scope.curUser.userName) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                } else {
                    $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                }
            });
        }
    	else {
            $http.post("admin/updateUser.do", {user: angular.toJson($scope.curUser)}).success(function (serviceStatus) {
                if (serviceStatus == '1') {
                    $scope.optFlag = 'none';
                    var requser = {};
                    requser.roleId = $scope.reqRole.roleId;
                    requser.userId = $scope.curUser.userId;
                    grantRole(requser);
                    getUserList();
                    $scope.verify = {dsName: true};
                    ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                } else {
                    $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                }
            });
        }
    };
    
    $scope.newRole = function () {
        $scope.optFlag = 'newRole';
        $scope.curRole = {};
        $uibModal.open({
            templateUrl: 'org/cboard/view/admin/modal/newRole.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'lg',
            scope: $scope,
            controller: ('userAdminCtrl',function ($scope, $uibModalInstance) {
            	$scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.saveRole = function() {
                	saveRole();
                	$uibModalInstance.close();
 				}
            })
        });
    };

    $scope.editRole = function (role) {
        $scope.optFlag = 'editRole';
        $scope.curRole = angular.copy(role);
        $uibModal.open({
            templateUrl: 'org/cboard/view/admin/modal/editRole.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'lg',
            scope: $scope,
            controller: ('userAdminCtrl',function ($scope, $uibModalInstance) {
            	$scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.saveRole = function() {
                	saveRole();
                	$uibModalInstance.close();
 				}
            })
        });
    };
   
    var saveRole = function () {
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
    
    var grantRole = function (userObj) {
        var userIds = [userObj.userId];
    	var roleIds = [userObj.roleId];
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
   
    $scope.resData = {};
    var roleIdSelected;
    $scope.changeResSelect = function (roleId) {
    	roleIdSelected = roleId;
		$scope.menuObj = {menuData : []};
		$scope.dashboardObj = {dashboardData : []};
	  	$scope.datasourceObj = {datasourceData : []};
	    $scope.datasetObj = {datasetData : []};
	    $scope.widgetObj = {widgetData : []};
	    $scope.jobObj = {jobData : []};
	    
    	$scope.roleResList.forEach(function(r){
      		if(roleIdSelected == r.roleId ){
      			if(r.resType == 'menu'){
      				$scope.menuObj.menuData.push(r.resId);
      			}
      			if(r.resType == 'board'){
      				$scope.dashboardObj.dashboardData.push(r.resId);
      			}
      			if(r.resType == 'datasource'){
      				$scope.datasourceObj.datasourceData.push(r.resId);
      			}
      			if(r.resType == 'dataset'){
      				$scope.datasetObj.datasetData.push(r.resId);
      			}
      			if(r.resType == 'widget'){
      				$scope.widgetObj.widgetData.push(r.resId);
      			}
      			if(r.resType == 'job'){
      				$scope.jobObj.jobData.push(r.resId);
      			}
      		}
    	});
    	$uibModal.open({
            templateUrl: 'org/cboard/view/admin/modal/grantResource.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'md',
            scope: $scope,
            controller: ('userAdminCtrl',function ($scope, $uibModalInstance) {
            	$scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.grantRes = function() {
                	grantRes();
                	$uibModalInstance.close();
 				}
             })
        });
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
    
    $scope.menuObj = {menuData : []};
    $scope.dashboardObj = {dashboardData : []};
    $scope.datasourceObj = {datasourceData : []};
    $scope.datasetObj = {datasetData : []};
    $scope.widgetObj = {widgetData : []};
    $scope.jobObj = {jobData : []};
    $scope.roleObj = {roleData : []};
    var grantRes = function () {
    	var roleIds = [];
    	roleIds.push(roleIdSelected);
        $scope.dataForSaveResource = [];
        // for menu tab
        if($scope.menuObj.menuData.length > 0) {
        	_.each($scope.menuObj.menuData, function (m) {
        		_.each($scope.menuListInMultiselect, function (r) {
        			if(m == r.resId){
        				$scope.dataForSaveResource.push({"resId":r.resId,"resType":r.type});
        			}
                });
            });
        }
        // for dashboard tab
        if($scope.dashboardObj.dashboardData.length > 0) {
        	_.each($scope.dashboardObj.dashboardData, function (m) {
        		_.each($scope.boardListInMultiselect, function (r) {
        			if(m == r.resId){
        				$scope.dataForSaveResource.push({"resId":r.resId,"resType":r.type});
        			}
                });
            });
        }
      // for datasource tab
        if($scope.datasourceObj.datasourceData.length > 0) {
        	_.each($scope.datasourceObj.datasourceData, function (m) {
        		_.each($scope.datasourceListInMultiselect, function (r) {
        			if(m == r.resId){
        				$scope.dataForSaveResource.push({"resId":r.resId,"resType":r.type});
        			}
                });
            });
        }
      // for dataset tab
        if($scope.datasetObj.datasetData.length > 0) {
        	_.each($scope.datasetObj.datasetData, function (m) {
        		_.each($scope.datasetListInMultiselect, function (r) {
        			if(m == r.resId){
        				$scope.dataForSaveResource.push({"resId":r.resId,"resType":r.type});
        			}
                });
            });
        }
      // for widget tab
        if($scope.widgetObj.widgetData.length > 0) {
        	_.each($scope.widgetObj.widgetData, function (m) {
        		_.each($scope.widgetListInMultiselect, function (r) {
        			if(m == r.resId){
        				$scope.dataForSaveResource.push({"resId":r.resId,"resType":r.type});
        			}
                });
            });
        }
      // for job tab
        if($scope.jobObj.jobData.length > 0) {
        	_.each($scope.jobObj.jobData, function (m) {
        		_.each($scope.jobListinMultiselect, function (r) {
        			if(m == r.resId){
        				$scope.dataForSaveResource.push({"resId":r.resId,"resType":r.type});
        			}
                });
            });
        }
        $http.post("admin/updateRoleRes.do", {
            roleIdArr: angular.toJson(roleIds),
            resIdArr: angular.toJson($scope.dataForSaveResource)
        }).success(function (serviceStatus) {
            if (serviceStatus == '1') {
                $scope.selectRole = null;
                $scope.selectRes = null;
                getRoleResList();
                ModalUtils.alert(translate('COMMON.SUCCESS'), 'modal-success', 'sm');
            } else {
                $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
            }
        });

    };

    $scope.deleteRole = function (roleObj) {
    	var roleName = roleObj.roleName;
    	ModalUtils.confirm(translate('COMMON.CONFIRM_DELETE')+roleName, 'modal-info', 'lg', function () {
            $http.post("admin/deleteRole.do", {
                roleId: roleObj.roleId
            }).success(function (serviceStatus) {
                if (serviceStatus == '1') {
                    $scope.selectRole = null;
                    $scope.selectRes = null;
                    getRoleList();
                    getRoleResList();
                    ModalUtils.alert(translate('COMMON.SUCCESS'), 'modal-success', 'sm');
                } else {
                    $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                }
            });
        });
    }

    $scope.deleteUser = function (userObj) {
    	var username=userObj.loginName;
        ModalUtils.confirm(translate('COMMON.CONFIRM_DELETE')+username, 'modal-info', 'lg', function () {
            $http.post("admin/deleteUser.do", {
                userId: userObj.userId
            }).success(function (serviceStatus) {
                if (serviceStatus == '1') {
                    $scope.selectUser = null;
                    getUserList();
                    ModalUtils.alert(translate('COMMON.SUCCESS'), 'modal-success', 'sm');
                } else {
                    $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                }
            });
        });
    }
    /*
	 * Code for pagination
	 */
    $scope.pageSize = 10;
    $scope.pager = {};
    $scope.setPageForUser = setPageForUser;
    $scope.setPageForRole = setPageForRole;
    
    var pageSizeArr = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 'ALL'];
    $scope.pageSizeArr = pageSizeArr;
    
    function setPageForUser(page) {
        if (page < 1 || page > $scope.pager.totalPages) {
            return;
        }
        $scope.pager = getPager($scope.userList.length, page, $scope.pageSize);
        $scope.finalUserList = $scope.userList.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);
    }
    
    var changePageSizeForUser = function() {
    	if($scope.pageSize == 'ALL')
    		$scope.pageSize = $scope.userList.length;
    	$scope.pager = getPager($scope.userList.length, 1, $scope.pageSize);
        $scope.finalUserList = $scope.userList.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);
    }
    $scope.changePageSizeForUser = changePageSizeForUser;
    
    function setPageForRole(page) {
        if (page < 1 || page > $scope.pager.totalPages) {
            return;
        }
        $scope.pager = getPager($scope.roleList.length, page, $scope.pageSize);
        $scope.finalRoleList = $scope.roleList.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);
    }
    
    var changePageSizeForRole = function() {
    	if($scope.pageSize == 'ALL')
    		$scope.pageSize = $scope.roleList.length;
    	$scope.pager = getPager($scope.roleList.length, 1, $scope.pageSize);
        $scope.finalRoleList = $scope.roleList.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);
    }
    
    $scope.changePageSizeForRole = changePageSizeForRole;
    
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