/**
 * Created by Fine on 2017/2/12.
 */

'user strict';
cBoard.service('freeLayoutService', function ($http) {
    this.setHeight = function () {
        var height = $(window).height() + 'px';

        $('.layoutPanel').css({
            height: height
        });
    };

    this.widget = function () {
        var random = new Date().getTime();
        var template = '<div class="chart_item widget_'+ random +'"></div>';

        $('.layoutPanel').append(template);
        return random;
    };

    this.widgetDrag = function (panel, $scope, callback) {
        var _this = this;

        panel.on({
            dragover: function (ev) {
                ev.preventDefault();
            },
            dragenter: function (ev) {

            },
            drop: function (e) {
                console.log(panel[0].clientWidth);
                var data = e.originalEvent.dataTransfer.getData('Text');
                var reportId = _this.widget();
                data = data ? JSON.parse(data) : null;
                var widget = $scope.widgetList.filter(function (d) {
                    return d.id === JSON.parse(data.id);
                });
                $('.widget_' + reportId).css({
                    width: panel[0].clientWidth - e.offsetX + 'px',
                    height: '150px',
                    left: e.offsetX + 'px',
                    top: e.offsetY + 'px'
                });
                var obj = {
                    config: widget[0].data.config,
                    datasetId: widget[0].data.datasetId,
                    datasource: null,
                    query: {}
                };
                callback.render($('.widget_' + reportId), obj, function (option) {
                    switch (widget[0].data.config.chart_type) {
                        case 'line':
                            $scope.previewDivWidth = 12;
                            option.toolbox = {
                                feature: {
                                    dataView: {
                                        show: true,
                                        readOnly: true
                                    }
                                }
                            };
                            break;
                        case 'pie':
                            $scope.previewDivWidth = 12;
                            option.toolbox = {
                                feature: {
                                    dataView: {
                                        show: true,
                                        readOnly: true
                                    }
                                }
                            };
                            break;
                        case 'kpi':
                            $scope.previewDivWidth = 6;
                            break;
                        case 'table':
                            $scope.previewDivWidth = 12;
                            break;
                        case 'funnel':
                            $scope.previewDivWidth = 12;
                            option.toolbox = {
                                feature: {
                                    dataView: {
                                        show: true,
                                        readOnly: true
                                    }
                                }
                            };
                            break;
                        case 'sankey':
                            $scope.previewDivWidth = 12;
                            option.toolbox = {
                                feature: {
                                    dataView: {
                                        show: true,
                                        readOnly: true
                                    }
                                }
                            };
                            break;
                        case 'map':
                            $scope.previewDivWidth = 12;
                            break;
                    }
                });
            }
        })
    }
});

