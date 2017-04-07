/**
 * Created by Fine on 2017/2/12.
 */

'user strict';
cBoard.service('freeLayoutService', function($http) {
    this.setHeight = ()=>{
        const height = $(window).height() + 'px';

        $('.layoutPanel').css({
            height: height
        });
    };

    this.widget = ()=>{
        const random = new Date().getTime();
        const template = '<div class="chart_item widget_'+ random +'"><div class="menu-bar"></div><div class="chart_widget"></div></div>';

        $('.layoutPanel').append(template);
        return random;
    };

    this.widgetData = ()=>{
        let promise = new Promise((resolve, reject)=>{
            $http.get("dashboard/getWidgetList.do").success(function (response) {
                if (response) {
                    resolve(response);
                }
                else {
                    reject(error);
                }
            });
        });

        return promise;
    };

    this.widgetDrag = (panel, $scope, callback)=>{
        let _this = this;

        panel.on({
            dragover(ev) {
                ev.preventDefault();
            },
            dragenter(ev) {
                // $('.drag-preview').removeClass('hideOperate');
                // $('.drag-preview').css({
                //     width: panel[0].clientWidth - ev.offsetX + 'px',
                //     height: '100px',
                //     left: ev.offsetX + 'px',
                //     top: ev.offsetY + 'px'
                // });
            },
            drop(e) {
                // $('.drag-preview').addClass('hideOperate');
                let widget = e.originalEvent.dataTransfer.getData('Text');
                let reportId = _this.widget();

                widget = widget ? JSON.parse(widget) : null;
                $('.widget_' + reportId).css({
                    width: panel[0].clientWidth - e.offsetX + 'px',
                    height: '350px',
                    left: e.offsetX + 'px',
                    top: e.offsetY + 'px'
                });
                let obj = {
                    config: widget.data.config,
                    datasetId: widget.data.datasetId,
                    datasource: null,
                    query: {}
                };
                callback.render($('.widget_' + reportId + ' .chart_widget'), obj, (option)=>{
                    switch (widget.data.config.chart_type) {
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
                _this.widgetMove();
            }
        });
    };

    this.widgetMove = ()=>{
        $('.menu-bar').on({
            mousedown(e){
                console.log($(e.target));
                console.log(e.offsetX)
            }
            // mousemove(e) {
            //
            // }
        });
    }
});

