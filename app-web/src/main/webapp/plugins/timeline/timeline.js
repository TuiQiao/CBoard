/**
 * Created by yfyuan on 2017/3/24.
 */
$(function () {
    var el = {
        win: window,
        nav: '.n_fixed_area',
        nBtnN1: '.n_btn_n1',
        nBtnN2: '.n_btn_n2',
        nBtnN3: '.n_btn_n3',
        timeItem: '.timeline-item',
        timeBody: '.timeline-body',
        itemTree: '.n_maptree_item',
        wrapTree: '.n_maptree_wrap',
        itemTreeS: '.n_maptree_item_s'
    };

    var cls = {
        nFixedNav: 'n_fixednav',
        faDown: 'fa-chevron-circle-down',
        faUp: 'fa-chevron-circle-up'
    };
    var status = {
        data: 'unfold',
        fold: '收起',
        unfold: '展开'
    };

    // $(el.win).on('scroll', function () {
    //     if ($(this).scrollTop() >= 106) {
    //         $(el.nav).addClass(cls.nFixedNav);
    //     } else {
    //         $(el.nav).removeClass(cls.nFixedNav);
    //     }
    // });

    $(document).on('click', el.nBtnN1, function (ev) {
        ev.preventDefault();
        var self = $(this),
            selfTimeItem = self.parents(el.timeItem),
            selfTimeBody = selfTimeItem.find(el.timeBody);

        if (!!selfTimeItem.data(status.data)) {
            selfTimeBody.slideDown(function () {
                self.removeClass(cls.faDown)
                    .addClass(cls.faUp)
                    .attr('title', status.fold);
                selfTimeItem.data(status.data, false);
            });
        } else {
            selfTimeBody.slideUp(function () {
                self.removeClass(cls.faUp)
                    .addClass(cls.faDown)
                    .attr('title', status.unfold);
                selfTimeItem.data(status.data, true);
            });
        }
    });

    // $(document).on('click', el.nBtnN2, function (ev) {
    //     ev.preventDefault();
    //     var self = $(this),
    //         selfItemTreeS = self.parents(el.itemTreeS),
    //         selfTimeItem = selfItemTreeS.find(el.timeItem);
    //
    //     if (!!selfItemTreeS.data(status.data)) {
    //         selfTimeItem.hide();
    //         selfItemTreeS.css('clear', 'none')
    //             .data(status.data, false);
    //     } else {
    //         selfTimeItem.show();
    //         selfItemTreeS.css('clear', 'both')
    //             .data(status.data, true);
    //     }
    // });
    //
    // $(document).on('click', el.nBtnN3, function (ev) {
    //     ev.preventDefault();
    //     var self = $(this),
    //         selfWrapTree = self.parents(el.wrapTree),
    //         selfItemTree = self.parents(el.itemTree),
    //         selfTimeBody = selfItemTree.find(el.timeBody),
    //         selfTimeLine = selfItemTree.find(el.timeItem),
    //         selfArrowBtn = selfItemTree.find(el.nBtnN1),
    //         selfItemTreeS = selfWrapTree.find(el.itemTreeS),
    //         selfTimeItem = selfItemTreeS.find(el.timeItem),
    //         itemTreeData = [];
    //
    //     // 收集所有次节点的展开状态
    //     selfItemTreeS.each(function (key, val) {
    //         itemTreeData.push(!!$(this).data(status.data));
    //     });
    //
    //     // 如果有一个次节点是展开的，点击主节点收起所有次节点
    //     if ($.inArray(true, itemTreeData) === -1) {
    //         selfTimeItem.show();
    //         selfItemTreeS.css('clear', 'both')
    //             .data(status.data, true);
    //         // 设置主节点展开状态：是
    //         selfWrapTree.data(status.data, true);
    //     } else {
    //         selfTimeItem.hide();
    //         selfItemTreeS.css('clear', 'none')
    //             .data(status.data, false);
    //         // 设置主节点展开状态：否
    //         selfWrapTree.data(status.data, false);
    //     }
    //
    //     selfTimeBody.show();
    //     selfArrowBtn.removeClass(cls.faDown)
    //         .addClass(cls.faUp)
    //         .attr('title', status.fold);
    //     selfTimeLine.data(status.data, false);
    // });
});