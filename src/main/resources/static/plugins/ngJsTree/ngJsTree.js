(function ($, undefined) {
    'use strict';
    $.jstree.defaults.alltrigger = null;
    $.jstree.plugins.alltrigger = function (options, parent) {
        this.init = function (el, opts) {
            if (options) {
                this.trigger = function (ev, data) {
                    parent.trigger.call(this, ev, data);
                    options(ev.replace('.jstree', '') + '.jstree', data);
                };
                var contextTrigger = $.vakata.context._trigger;
                $.vakata.context._trigger = function (event_name) {
                    contextTrigger(event_name);
                    options('context_' + event_name + '.vakata');
                };
                var dndTrigger = $.vakata.dnd._trigger;
                $.vakata.dnd._trigger = function (event_name, e, data) {
                    dndTrigger(event_name, e, data);
                    options('dnd_' + event_name + '.vakata', e, data);
                };
            }
            parent.init.call(this, el, opts);
        };
    };
})(jQuery);
(function (angular) {
    'use strict';

    //// JavaScript Code ////
    function jsTreeCtrl() {
        /*jshint validthis:true */
        var nodeSerialId = 1;
        var vm = this;

        vm.nodesFingerprint = function (e) {
            if (!e.__uiNodeId) {
                e.__uiNodeId = nodeSerialId++;
            }
            return '' + e.__uiNodeId + (e.id || '') + (e.text || '') + (e.type || '');
        };

        vm.changeWatcher = function (arraySource, tokenFn) {
            var self;
            var getTokens = function () {
                var result = [], token, el;
                if (arraySource) {
                    var array = angular.isFunction(arraySource) ? arraySource() : arraySource;
                    for (var i = 0, n = array.length; i < n; i++) {
                        el = array[i];
                        token = tokenFn(el);
                        map[token] = el;
                        result.push(token);
                    }
                }
                return result;
            };
            // returns elements in that are in a but not in b
            // subtractAsSets([4, 5, 6], [4, 5, 7]) => [6]
            var subtractAsSets = function (a, b) {
                var result = [], inB = {}, i, n;
                for (i = 0, n = b.length; i < n; i++) {
                    inB[b[i]] = true;
                }
                for (i = 0, n = a.length; i < n; i++) {
                    if (!inB[a[i]]) {
                        result.push(a[i]);
                    }
                }
                return result;
            };

            // Map objects to tokens and vice-versa
            var map = {};

            var applyChanges = function (newTokens, oldTokens) {
                var i, n, el, token;
                var replacedTokens = {};
                var removedTokens = subtractAsSets(oldTokens, newTokens);
                for (i = 0, n = removedTokens.length; i < n; i++) {
                    var removedToken = removedTokens[i];
                    el = map[removedToken];
                    delete map[removedToken];
                    var newToken = tokenFn(el);
                    // if the element wasn't removed but simply got a new token, its old token will be different from the current one
                    if (newToken === removedToken) {
                        self.onRemoved(el);
                    } else {
                        replacedTokens[newToken] = removedToken;
                        self.onChanged(el);
                    }
                }

                var addedTokens = subtractAsSets(newTokens, oldTokens);
                for (i = 0, n = addedTokens.length; i < n; i++) {
                    token = addedTokens[i];
                    el = map[token];
                    if (!replacedTokens[token]) {
                        self.onAdded(el);
                    }
                }

            };
            self = {
                subscribe: function (scope, onChanged) {
                    scope.$watch(getTokens, function (newTokens, oldTokens) {
                        if (!onChanged || onChanged(newTokens, oldTokens) !== false) {
                            applyChanges(newTokens, oldTokens);
                        }
                    }, true);
                },
                onAdded: angular.noop,
                onChanged: angular.noop,
                onRemoved: angular.noop
            };
            return self;
        };
    }

    function jsTreeDirective($timeout) {
        return {
            restrict: 'A',
            scope: {
                treeData: '=ngModel',
                treeEventsObj: '=?treeEventsObj',
                shouldApply: '&'
            },
            controller: 'jsTreeCtrl',
            link: function link(scope, elm, attrs, controller) {

                var config = null,
                    nodesWatcher = controller.changeWatcher(scope.treeData, controller.nodesFingerprint),
                    events = [];

                var blocked = false;

                function treeEventHandler(s, cb) {
                    return function () {
                        var args = arguments;
                        var fn = s.$parent.$eval(cb);
                        if (!s.$root.$$phase) {
                            s.$parent.$apply(function () {
                                fn.apply(s.$parent, args);
                            });
                        } else {
                            fn.apply(s.$parent, args);
                        }
                    };
                }

                function manageEvents(s, e, a) {
                    if (a.treeEvents) {
                        var evMap = a.treeEvents.split(';');
                        for (var i = 0; i < evMap.length; i++) {
                            if (evMap[i].length > 0) {
                                var name = evMap[i].split(':')[0];
                                var cb = evMap[i].split(':')[1];
                                if (name.indexOf('.') === -1) {
                                    name += '.jstree';
                                }
                                events.push(name);
                                if (name.indexOf('.vakata') === -1) {
                                    s.tree.on(name, treeEventHandler(s, cb));
                                } else {
                                    $(document).on(name, treeEventHandler(s, cb));
                                }
                            }
                        }
                    }
                    if (angular.isObject(s.treeEventsObj)) {
                        angular.forEach(s.treeEventsObj, function (cb, name) {
                            if (name.indexOf('.') === -1) {
                                name += '.jstree';
                            }
                            events.push(name);
                            if (name.indexOf('.vakata') === -1) {
                                s.tree.on(name, function () {
                                    var args = arguments;
                                    if (!s.$root.$$phase) {
                                        s.$parent.$apply(function () {
                                            cb.apply(s.$parent, args);
                                        });
                                    } else {
                                        cb.apply(s.$parent, args);
                                    }
                                });
                            } else {
                                $(document).on(name, function () {
                                    var args = arguments;
                                    if (!s.$root.$$phase) {
                                        s.$parent.$apply(function () { cb.apply(s.$parent, args); });
                                    } else {
                                        cb.apply(s.$parent, args);
                                    }
                                });
                            }
                        });
                    }
                }

                function getOptions() {
                    var jsTreeSettings = attrs.jsTree ? scope.$parent.$eval(attrs.jsTree) : {};
                    config = {};
                    angular.copy(jsTreeSettings, config);
                    var result = JSON.stringify(config);
                    if (config.core) {
                        config.core.data = scope.treeData;
                    }
                    else {
                        config.core = { data: scope.treeData };
                    }
                    if (config.plugins) {
                        config.plugins.push('alltrigger');
                    } else {
                        config.plugins = ['alltrigger'];
                    }
                    config.alltrigger = function (name) {
                        if (!scope.$root.$$phase && events.indexOf(name) === -1) {
                            scope.$apply();
                        }
                    };
                    return result;
                }

                scope.destroy = function () {
                    events = [];
                    if (attrs.tree) {
                        if (attrs.tree.indexOf('.') !== -1) {
                            var split = attrs.tree.split('.');
                            var tree = split.pop();
                            var context = scope.$parent;
                            for (var i = 0; i < split.length; i++) {
                                context = context[split[i]];
                            }
                            scope.tree = context[tree] = elm;
                        }
                        else {
                            scope.tree = scope.$parent[attrs.tree] = elm;
                        }

                    } else {
                        scope.tree = elm;
                    }
                    scope.tree.jstree('destroy');
                };

                scope.init = function () {
                    scope.tree.jstree(config);
                    $timeout(function () {
                        manageEvents(scope, elm, attrs);
                    });
                };

                nodesWatcher.onChanged = function (node) {
                    if (angular.isDefined(scope.tree.jstree(true).set_type)) {
                        scope.tree.jstree(true).set_type(node.id, node.type);
                    }
                    scope.tree.jstree(true).rename_node(node.id, node.text);
                };

                nodesWatcher.onAdded = function (node) {
                    $timeout(function () {
                        while (blocked) { }
                        blocked = true;
                        var parent = scope.tree.jstree(true).get_node(node.parent);
                        var res = scope.tree.jstree(true).create_node(parent, node, 'inside', function () {
                            blocked = false;
                        });
                        if (!res) {
                            blocked = false;
                        }
                    });
                };

                nodesWatcher.onRemoved = function (node) {
                    scope.tree.jstree(true).delete_node(node.id);
                };

                nodesWatcher.subscribe(scope, function () {
                    if (!scope.shouldApply) {
                        return true;
                    }
                    return scope.shouldApply();
                });

                scope.$watch(getOptions, function () {
                    scope.destroy();
                    scope.init();
                });
            }
        };
    }

    //// Angular Code ////
    var mi = angular.module('ngJsTree', []);
    mi.controller('jsTreeCtrl', jsTreeCtrl);
    mi.directive('jsTree', ['$timeout', jsTreeDirective]);

})(angular);