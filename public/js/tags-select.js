/**
 * 分享编辑页面的标签选择
 */
define(function(require, exports){
    var $ = require('jquery'),
        mustache = require('mustache');
    $('#tags-cloud').delegate('.tag', 'click', function(ev){
        ev.preventDefault();
        var et = $(ev.target),
            elinput = $('#tags'),
            eltext = elinput.val().replace(/ ?$/,'');
        if(eltext.length > 0){
            eltext += ', ';
        }
        elinput.val(eltext + et.text());
        elinput[0].focus();
    });
});
