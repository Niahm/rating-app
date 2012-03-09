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
            _(res).each(function(item){
                item.id = item._id
            });
            return res;
        }
    });

    var ChooserView = Backbone.View.extend({
        onSubmit : function(ev){
            this.trigger('submit');
        },

        el : '#choose-share',

        events : {
            'click .submit' : 'onSubmit'
        },
    },Backbone.Events);

    var ShareListView = Backbone.View.extend({
        initialize : function(option){
            this.template = $('#tmpl-share-list').html();
            this.$el = $(this.el);
        },

        el : '#share-list',

        className : 'explore',

        render : function(shares){
            var self = this,
                $el = self.$el;

            _(shares).each(function(share){
                share.authors = share.authors.join(', ');
            });

            $el.html(mustache.to_html(self.template, {
                list : shares
            }));

            return self;
        },

        onSelect : function(ev){
            ev.preventDefault();
            var item = $(ev.currentTarget);
            var id = item.attr('data-id');
            if(!id){
                return;
            }
            this.trigger('select', {
                id : id
            });
            item.slideUp(function(){
                item.remove();
            });
        },
        events : {
            'click li' : 'onSelect'
        }

    },Backbone.Events);

    var ShareCoverView = Backbone.View.extend({
        initialize : function(option){
            this.template = $('#tmpl-selected-list').html();
            this.$el = $(this.el);
        },

        el : '#selected-list',

        className : 'explore',

        render : function(shares){
            var self = this,
                $el = self.$el;

            _(shares).each(function(share){
                share.authors = share.authors.join(', ');
            });

            $el.html(mustache.to_html(self.template, {
                list : shares
            }));

            return self;
        },
        onDelete : function(ev){
            ev.preventDefault();
            var item = $(ev.target).parent('.shareitem');
            var id = item.attr('data-id');
            this.trigger('select', {
                id : id
            });
            item.remove();
        },
        events : {
            'click .close' : 'onDelete'
        }

    },Backbone.Events);

    var SearchBoxView = Backbone.View.extend({
        initialize : function(option){
            this.$input = this.$el.find('input');
            this.render();
        },
        el : '#search-box',

        events : {
            'keydown' : 'onKeyDown',
            'keyup' : 'onKeyUp',
            'click .clear-search' : 'onClearSearch'
        },

        onKeyUp : function(ev){
            var self = this;
            self.render().trigger('search', {
                text : self.$input.val()
            });
        },

        onKeyDown : function(ev){
            var self = this;
        },

        onClearSearch : function(ev){
            this.trigger('search', {
                text : ''
            });
        },
        className : 'search-form',
        render : function(){
            var self = this,
                $el = self.$el,
                $ec = $el.find('.clear-search');
            if(self.$input.val()){
                $ec.show();
            }else{
                $ec.hide();
            }
            return self;
        }
    },Backbone.Events);

    var AppRouter = Backbone.Router.extend({
        initialize : function(config){
            var self = this;

            self.shareset = config.shareset;

            self.shares = new Shares();
            self.selectedShares = new Shares();

            self.sharelistView = new ShareListView();
            self.selectedView = new ShareCoverView();
            self.chooseView = new ChooserView();

            self.searchBoxView = new SearchBoxView();
            self.initEvent();

            self.reset();
        },

        initEvent : function(){
            var self = this;

            self.sharelistView.bind('select',function(ev){
                model = self.shares.get(ev.id);
                if(!model) return;
                self.shares.remove(model);
                self.selectedShares.add(model);
            });

            self.selectedView.bind('select',function(ev){
                model = self.selectedShares.get(ev.id);
                if(!model) return;
                self.selectedShares.remove(model);
                self.shares.add(model);
            });

            self.selectedShares.bind('add',function(){
                self.selectedView.render(this.toJSON());
            });

            self.shares.bind('reset add',function(x,y){
                self.sharelistView.render(this.toJSON());
            });

            self.chooseView.bind('submit',function(ev){
                var s = [];
                self.selectedShares.each(function(model){
                    s.push(model.id);
                });
                if(s.length>0){
                    $.ajax({
                        url : '/shareset/' + self.shareset +'/addshares',
                        type : 'get',
                        data : {
                            shares : s.join(',')
                        },
                        dataType : 'json'
                    }).success(function(data){
                        if(data.error){
                            alert(data.error);
                            return;
                        }
                        if(data.action === 'redirect'){
                            location = data.url;
                        }else{
                            alert('成功');
                        }
                    });
                }else{
                    alert('请先选择宝贝');
                }
            });

            self.searchBoxView.bind('search',function(data){
                self.shares.fetch({
                    data : {
                        search : data.text,
                        size : 10
                    }
                });
            });
        },

        reset: function(){
            var self = this;
            self.shares.fetch({
                data : {size:10}
            });
        }
    });
    exports.Chooser = AppRouter
});
