define(function(require, exports, module){

    var Backbone = require('backbone'),
        moment = require('moment'),
        _ = require('underscore'),
        mustache = require('mustache'),
        $ = require('jquery');

    var Share = Backbone.Model.extend({
        urlRoot : '/share'
    });

    var Shares = Backbone.Collection.extend({
        model : Share,
        url : '/share',
        parse : function(res){
            return res;
        }
    });

    var ShareListView = Backbone.View.extend({
        initialize : function(option){
            this.template = $('#template-list').html();
            this.app = option.app;
        },

        events : {
        },
        className : 'explore',
        render : function(shares){
            var self = this,
                el = $(self.el);

            _(shares).each(function(share){
                share.authors = share.authors.join(', ');
            });

            el.html(mustache.to_html(self.template, {
                list : shares
            }));

            return self;
        }
    });

    var SearchBoxView = Backbone.View.extend({
        initialize : function(option){
            this.app = option.app;
            this.$el = $(this.el);
            this.$input = this.$el.find('input');
        },
        el : '#search-box',

        events : {
            'keydown' : 'onKeyDown',
            'click .clear-search' : 'onClearSearch'
        },
        onKeyDown : function(ev){
            if(ev.keyCode === 13){
                this.app.navigate('search/'+ this.$input.val() ,{
                    trigger : true
                });
            }
        },
        onClearSearch : function(ev){
            this.app.navigate('' , {
                    trigger : true
                });
        },
        className : 'search-form',
        render : function(search){
            var $el = this.$el;
            if(!search){
                this.$input.val('')
                $el.find('.clear-search').hide();
            }else{
                this.$input.val(search)
                $el.find('.clear-search').show();
            }
            return self;
        }
    });

    var TagsView = Backbone.View.extend({
        initialize : function(app){
            this.app = app;
            this.template = $('#template-tags').html();
        },
        className : 'tags',
        render : function(tags){
            _(tags).each(function(tag){
                //字体大小
                tag.size = 12+Math.round(tag.count/10);
            });

            $(this.el).html(mustache.to_html(this.template, {
                tags : tags
            }));
        }
    });

    var TagQueryView = Backbone.View.extend({
        initialize : function(app){
            this.app = app;
            this.template = $('#template-tagquery').html();
        },
        className : 'tags-query',

        render : function(tag){
            $(this.el).html(mustache.to_html(this.template, {
                tag : tag
            }));
        }
    });

    var AppRouter = Backbone.Router.extend({
        initialize : function(){
            var shares = this.shares = new Shares();

            var sharelistView = this.sharelistView = new ShareListView({
                app : this
            });

            var tagsView = new TagsView({
                app : this
            });
            var tagQueryView = this.tagQueryView = new TagQueryView({
                app : this
            });

            this.searchBoxView = new SearchBoxView({
                app : this
            })

            shares.bind('change',function(){
                alert('change');
            });

            shares.bind('reset',function(x,y){
                sharelistView.render(this.toJSON());
            });

            $.ajax({
                url : '/json/tags',
                dataType : 'json'
            }).success(function(tags){
                tagsView.render(tags)
            });

            $('#Explore').append(sharelistView.el);
            $('#Tags').append(tagsView.el);

        },
        routes : {
            '' : 'index',
            'tags/:tag' : 'tags',
            'search/:text' : 'search'
        },
        index : function(){
            this.shares.fetch();
            this.searchBoxView.render();
            $('#Query').hide();
        },
        search : function(text){
            this.searchBoxView.render(text);
            this.shares.fetch({
                data : {
                    search : text
                }
            });
        },
        tags : function(tag){
            this.tagQueryView.render(tag);
            $('#Query').append(this.tagQueryView.el).show();
            this.shares.fetch({
                data : 'tags=' + tag
            });
        }
    });


    //start
    var router = new AppRouter();
    Backbone.history.start();
});
