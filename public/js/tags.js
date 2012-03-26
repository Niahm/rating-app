/**
 * 异步渲染分享标签
 */
define(function(require, exports, module){
    var $ = require('jquery'),
        mustache = require('mustache');
    module.exports = function(config){
        var tmpl = $(config.template).html();
        $.ajax({
            url : '/json/tags',
            dataType : 'json'
        }).success(function(tags){
            $(config.el).html(mustache.to_html(tmpl, {
                tags : tags
            }));
        });
    }
});
