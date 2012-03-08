define(function(require, exports, module){
    var mustache = require('mustache'),
        $ = require('jquery');
        moment = require('moment');
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
            $.each(data,function(index){
                this.date = moment(this.date).fromNow();
                console.log(this.date);
            });
            this.template = $('#template-latest').html();
            var el = $('#Latest');
            el.html(mustache.to_html(this.template,{
                list : data
            }));
        }
    }).done(function(){
        KISSY.use('switchable',function(S,Switchable){
            var Accordion = Switchable.Accordion;
            S.ready(function(S) {
                window.accordion = Accordion('#J_accordion', {
                    easing:'easeIn',
                    multiple:false,
                    switchTo:0
                });
            });
        });
    });;
});
