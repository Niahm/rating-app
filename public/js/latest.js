define(function(require, exports, module){
    var mustache = require('mustache'),
        _ = require('underscore'),
        $ = require('jquery'),
        moment = require('moment');
    moment.lang('zh-cn');
    $.ajax({
        url : '/share?size=8&sort=viewCount',
        dataType : 'json',
        success : function(data){
            this.template = $('#template-hotest').html();
            var el = $('#Hotest');
            el.html(mustache.to_html(this.template,{
                list : data
            }));
        }
    });
    $.ajax({
        url : '/shareset?type=recent&pop_share=1',
        dataType : 'json',
        success : function(data){
            _.each(data,function(item, idx){
                var hour = item.startTime.split(':')[0]
                item.date = moment(item.date).add('hours',parseInt(hour)).fromNow();
                item._class=!idx?'in':'';
            });
            $('#Latest').html(mustache.to_html($('#template-latest').html(),{
                list : data
            }));
        }
    }).done(function(){
        //KISSY.use('switchable',function(S,Switchable){
            //var Accordion = Switchable.Accordion;
            //S.ready(function(S) {
                //window.accordion = Accordion('#J_accordion', {
                    //easing:'easeIn',
                    //multiple:false,
                    //switchTo:0
                //});
            //});
        //});
    });;
});
