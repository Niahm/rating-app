/*jslint devel: false, browser: true, passfail: true, nomen: true, maxerr: 50, indent: 4 */
/*global define */
define(function (require, exports, module) {
    'use strict';
    var mustache = require('mustache'),
        _ = require('underscore'),
        $ = require('jquery'),
        moment = require('moment'),
        loadingHtml = '<div class="loading">loading...</div>';
    moment.lang('zh-cn');

    function renderHotShare() {
        var dfd = new $.Deferred(),
            el = $('#Hotest');
        el.html(loadingHtml);
        $.ajax({
            url : '/share?size=8',
            dataType : 'json',
            success : function (data) {
                this.template = $('#template-hotest').html();
                el.html(mustache.to_html(this.template, {
                    list : data
                }));
                dfd.resolve('render-success');
            }
        });
        return dfd.promise();
    }

    function renderRecent () {
        var el = $('#Latest');
        el.html(loadingHtml);
        return $.ajax({
            url : '/shareset/?type=recent&pop_share=1',
            dataType : 'json',
            success : function (data) {
                _.each(data, function (item, idx) {
                    var hour = item.startTime.split(':')[0];
                    item
                        .date = moment(item.date)
                        .add('hours', parseInt(hour, 10))
                        .fromNow();
                    item._class = !idx ? 'in' : '';
                });
                el.html(mustache.to_html($('#template-latest').html(), {
                    list : data
                }));
            }
        });
    }

    function loadTags() {
        var tmpl = $('#template-tags').html(),
            el = $('#tags-cloud');
        el.html(loadingHtml);
        return $.ajax({
            url : '/json/tags',
            dataType : 'json'
        }).success(function (tags) {
            el.html(mustache.to_html(tmpl, {
                tags : tags
            }));
        });
    }

    $(function () {
        renderRecent().done(function (dd) {
            renderHotShare().done(function () {
                loadTags();
            });
        });
    });
});
