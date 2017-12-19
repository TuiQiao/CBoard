/**
 * Created by Fine on 2017/2/12.
 */

'user strict';
cBoard.service('freeLayoutService', function($http) {
    this.saveData = [];
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

    this.widgetSave = (args)=>{

    };

    this.widgetDrag = (panel, $scope, callback)=>{
        let _this = this;

        panel.on({
            dragover(ev) {
                ev.preventDefault();
                // console.log(ev.offsetX);
            },
            // mousemove(e) {
            //     // console.log(e.offsetX);
            // },
            dragenter(ev) {
                // console.log(ev.offsetX);
                // $('.drag-preview').removeClass('hideOperate');
                // $('.drag-preview').css({
                //     width: panel[0].clientWidth - ev.offsetX + 'px',
                //     height: '100px',
                //     left: ev.offsetX + 'px',
                //     top: ev.offsetY + 'px'
                // });
            },
            drop(e) {
                let panelWidth = panel[0].clientWidth,
                    panelHeight = panel[0].clientHeight,
                    gridHeight = panelHeight / 47,
                    gridWidth = panelWidth / 47,
                    chartWidth = panelWidth - e.offsetX + 'px',
                    // percentWidth = gridWidth / panelWidth,
                    gridX = parseInt(e.offsetX / gridWidth),
                    gridEx = parseInt((e.offsetX + chartWidth) / gridWidth),
                    gridY = parseInt(e.offsetY / gridHeight),
                    gridEy = parseInt((e.offsetY + 350) / gridHeight),
                    gridLeft = gridX * gridWidth,
                    gridTop = gridY * gridHeight,
                    widget = e.originalEvent.dataTransfer.getData('Text'),
                    reportId = _this.widget();

                widget = widget ? JSON.parse(widget) : null;
                $('.widget_' + reportId).css({
                    width: chartWidth,
                    height: '350px',
                    left: gridLeft + 'px',
                    top: gridTop + 'px'
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
                let params = {
                    reportId: reportId,
                    x: gridX + 1,
                    ex: gridEx + 1,
                    y: gridY + 1,
                    ey: gridEy + 1
                };

                _this.saveData.push(params);
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

