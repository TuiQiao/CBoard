/**
 * Created by zyong on 2016/12/27.
 */


var getContextMenu =function ($node) {
   
    if ($node.parent != '#' && !$node.original.ischild) {
        return {
            create: {
                label: function () {
                    return 'CREATE';
                },
                action: function (obj) {
                    node = $(obj.reference).jstree(true).create_node($node);
                }
            },
            rename: {
                label: function () {
                    return 'RENAME';
                },
                action: function (obj) {
                    $(obj.reference).jstree(true).edit($node);
                }
            },
            delete: {
                label: function () {
                    return 'DELETE';
                },
                action: function (obj) {
                    $(obj.reference).jstree(true).delete_node($node);
                }
            }
        };
    } else if($node.parent == '#') {
        return{
            create: {
                label: function () {
                    return 'CREATE';
                },
                action: function (obj) {
                    $node = $(obj.reference).jstree(true).create_node($node);
                }
            }
        };
    }
};
/**
 *
 * Configuration for DataSet/Widget/Dashboard tree
 */
var jsTreeConfig1 = {
    core : {
        multiple : false,
        animation: true,
        error : function(error) {
            //$log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
        },
        check_callback : function(operation, node, node_parent, node_position, more) {
            if (operation === "move_node") {
                //only allow dropping inside nodes of type 'Parent'
                return node_parent.icon == true;
            }
            return true;  //allow all other operations
        },
        worker : true
    },
    types : {
        default : {
            valid_children : ["default","file"]
        },
        file : {
            icon : 'glyphicon glyphicon-file'
        }
    },
    dnd : {
        check_while_dragging: true
    },
    contextmenu: {
        items: getContextMenu,
        select_node: false
    },
    search: {
        show_only_matches : true,
        // show_only_matches_children : true,
        search_callback: function(str, node){
            var word;
            var keys = str.split(':');
            if (keys.length == 2) {
                if (keys[0] == 'dsr' || keys[0] == 'ds') {
                    word = keys[1];
                }
                if(word != '' && node.original.dsrName != undefined && node.original.dsrName.indexOf(word) >= 0)
                    return true;
                if(word != '' && node.original.dsName != undefined && node.original.dsName.indexOf(word) >= 0)
                    return true;
            }else {
                word = str;
                if(node.text.indexOf(word) >= 0)
                    return true;
            }
        }
    },
    state: {"key": "cboard"},
    version: 1,
    plugins: ['types', 'unique', 'state', 'dnd', 'contextmenu', 'search']
};


/**
 * Holds all jstree related functions and variables, including the actual class and methods to create, access and manipulate instances.
 * @param domID
 */
function jstree_GetWholeTree(domID) {
    return $("#" + domID).jstree(true);
}
/**
 * get an array of all selected nodes
 * @returns {jQuery}
 */
function jstree_GetSelectedNodes(domID) {
    return jstree_GetWholeTree(domID).get_selected(true);
}

function jstree_CvtVPath2TreeData (listIn) {
    var listOut = [];
    // listOut.push({"id": "-1", "parent": "#", "text": "Root", state: {opened: true}});
    for (var i = 0; i < listIn.length; i++) {
        if(listIn[i].type == "child") {

            listOut.push({
                "id": listIn[i].id.toString(),
                "parent": listIn[i].parentId.toString(),
                "text": listIn[i].name.toString(),
                "type": listIn[i].type.toString,
                "dsName": listIn[i].datasetName,
                "dsrName": listIn[i].datasourceName,
                icon: 'glyphicon glyphicon-file',
                ischild: true
            });
        }
    }
    return listOut;
}


function jstree_CheckTreeNode(actionType, treeID, popup) {
    var selectedNodes = jstree_GetSelectedNodes(treeID);
    if (selectedNodes === undefined ) {
        return false;
    } else if (selectedNodes.length == 0) {
        popup("Please, select one widget first!", "modal-warning", "lg");
        return false;
    } else if (typeof(selectedNodes[0].children) != "undefined" && selectedNodes[0].children.length > 0) {
        popup("Can't " + actionType + " a folder!", "modal-warning", "lg");
        return false;
    } else {
        return true;
    }
}


function jstree_ReloadTree (treeID, treeData, ngScope) {
    jstree_GetWholeTree(treeID).settings.core.data = treeData;
    jstree_GetWholeTree(treeID).refresh();
}

/**
 *
 * @param paramObj {
 *      "actionType": tag,
 *      "treeID": treeID,
 *      "copyFunc": function,
 *      "node": selectedNode:
 * }
 * @returns {Function}
 */
var jstree_CopyNode = function(paramObj) {
    return function () {
        if (!jstree_CheckTreeNode(paramObj.actionType, paramObj.treeID)) {
            return;
        }
        paramObj.copyFunction(paramObj.oldNode);
    };
};

/**
 * {
 *   treeID: xx,
 *   ngScope: $scope,
 *   ngHttp: $http,
 *   ngTimeout $timeout,
 *   listName: "widgetList",
 *   updateUrl: xxx
 * }
 * @param option
 * @returns {{ready: ready, activate_node: activate_node, dblclick: dblclick, move_node: move_node}}
 */
function jstree_baseTreeEventsObj(option) {
        return  {
            ready: function() {
                option.ngTimeout(function() {
                    option.ngScope.ignoreChanges = false;
                });
            },
            activate_node: function(obj, e) {
                var myJsTree = jstree_GetWholeTree(option.treeID);
                var data = myJsTree.get_selected(true)[0];
                if (data.children.length > 0) {
                    myJsTree.deselect_node(data);
                    myJsTree.toggle_node(data);
                }
            },
            dblclick: function () {
                var selectedNodes = jstree_GetSelectedNodes(option.treeID);
                if (selectedNodes.length == 0) return; // Ignore double click folder action
                option.ngScope.editNode();
            },
            create_node: function (obj, node ) {

                var rename = function (node) {
                    var myJsTree = jstree_GetWholeTree(option.treeID);
                    
                    var data = myJsTree.get_node(node.sysid);
                    if (data) {
                        data.newid = node.id;
                        myJsTree.edit(data);
                    }
                };
                
                var item = {"sysid": node.node.id, "name": node.node.text,"parentId":node.parent};

                option.ngHttp.post("dashboard/saveNewFolder.do", {json: angular.toJson(item)}).success(function (serviceStatus) {
                    if (serviceStatus.status == '1') {
                        item.id = serviceStatus.id;
                        rename(item);
                    } else {
                        console.log(serviceStatus.msg);
                    }
                });
            },
            rename_node: function (obj, node) {
                var item = {};
                if(node.node.newid != null){
                    item.id = node.node.newid;
                    item.parentId = node.node.parent;
                    node.node.id = item.id.toString();
                }else {
                    item = _.find(option.ngScope["folderList"], function (i) {
                        return i.id == node.node.id;
                    });
                }
                item.name = node.node.text;
                
                option.ngHttp.post("dashboard/updateFolder.do", {json: angular.toJson(item)}).success(function (serviceStatus) {
                    if (serviceStatus.status == '1') {
                        option.ngScope.getFolderList();
                    } else {
                        console.log(serviceStatus.msg);
                    }
                });                
            },
            delete_node: function (obj, node) {
                var items = angular.copy(node.node.children);
                items.push(node.node.id);
                for(var i=0;i<items.length;i++) {
                    option.ngHttp.post("dashboard/deleteFolder.do?id=" + items[i]).success(function (serviceStatus) {
                        if (serviceStatus.status == '1') {
                            //console.log('success!');
                        } else {
                            option.ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                            // option.ngScope.searchNode();
                            return false;
                        }
                    });
                }
                
                var folders = node.node.children;
                var childs = node.node.children_d;
                var items = childs.sort().splice(childs.length - folders.length);
                if(items.length > 0){
                    // var items = node.node.children;
                    for(var i=0;i<items.length;i++){
                        option.ngHttp.post(option.deleteUrl, {id: items[i]}).success(function (serviceStatus) {
                            if (serviceStatus.status == '1') {
                                //console.log('success!');
                            } else {
                                option.ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                            }
                        });
                    }
                }
            },
            move_node: function (e, data) {

                var updateItem = function (nodeid, newParent) {
                    var item = _.find(option.ngScope[option.listName], function (i) { return i.id == nodeid; });
                    item.folderId = newParent;
                    option.ngHttp.post(option.updateUrl, {json: angular.toJson(item)}).success(function (serviceStatus) {
                        if (serviceStatus.status == '1') {
                            
                        } else {
                            option.ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                        }
                    });
                };

                var updateFolder = function (nodeid, newParent) {
                    var item = _.find(option.ngScope["folderList"], function (i) { return i.id == nodeid; });
                    item.parentId = newParent;
                    option.ngHttp.post("dashboard/updateFolder.do", {json: angular.toJson(item)}).success(function (serviceStatus) {
                        if (serviceStatus.status == '1') {
                            //console.log('success!');
                        } else {
                            option.ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                        }
                    });
                };

                var updateNode = function (node, tarPath) {
                    if (node.children.length == 0 && node.original.type != "parent") {
                        updateItem(node.id, tarPath);
                    } else {
                        updateFolder(node.id, tarPath);
                    }
                };

                var myJsTree = jstree_GetWholeTree(option.treeID),
                    curNode = data.node,
                    tarNodeID = data.parent;
                var tarPath = tarNodeID;
                updateNode(curNode, tarPath);
            }
        };
}