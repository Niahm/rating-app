(function(){

    var API = {
        ADD: '/sharewish/add',
        GET: '/sharewish/get'
    };

    var ShareWishManager = {

        add: function ( newWish, next ){

            $.post( API.ADD, newWish, function ( res ){

                next( res );
            });
        },

        get: function ( queryObj, next ){

            $.get( API.GET, {}, function ( res ){

                next( res );
            });
        }
    };

    var ShareWishView = {

        init: function (){

            this.form = newWishForm.init();
            this.wishList = $( '.J_wish-list' );

            this.fetch();
            this.attach();

        },

        fetch: function (){

            var that = this;

            ShareWishManager.get({}, function ( res ){

                if( res.result ){

                    var wishes = res.data;

                    $.each( wishes, function ( index, wish ){

                        that.wishList.append( '<li rel="tooltip" data-original-title="' + ( wish.description ? wish.description : '没有描述哦' ) + '" class="label label-info">' + wish.topic + '</li>')
                    });
                }
            });
        },

        attach: function (){

            $( this.form ).bind( 'wishAdd', function ( e, newWishObj ){

                if( !newWishObj.topic ){
                    alert( '心愿主题不能为空!' );
                }
                else {

                    ShareWishManager.add( newWishObj, function ( res ){

                        if( res.result ){

                            alert( '心愿添加成功!' );
                            location.reload();
                        }
                        else {

                            alert( '心愿添加出错:' + res.msg + JSON.stringify( res.err ) );
                        }
                    });
                }
            });

            // 添加tooltip
            this.wishList.tooltip({ selector: 'li' });
        }
    };

    var newWishForm = {

        init: function (){
            this.topic = $( '.J_topic-ipt' );
            this.description = $( '.J_description-textarea').hide();
            this.descTrigger = $( '.J_desc-trigger' );
            this.descTriggerIcon = this.descTrigger.children( 'i' );
            this.submitBtn = $( '.J_submit-wish' );

            this.attach();

            return this;
        },

        attach: function (){

            var that = this;

            this.descTrigger.bind( 'click', function (){

                var ifOpen = !that.descTriggerIcon.hasClass( 'icon-chevron-down' );

                that.descTriggerIcon.toggleClass( 'icon-chevron-down' );
                that.descTriggerIcon.toggleClass( 'icon-chevron-up' );

                if( ifOpen ){

                    that.description.fadeOut( 200 );
                }
                else {

                    that.description.fadeIn( 200 );
                }
            });

            this.submitBtn.bind( 'click', function (){

                $( that).trigger( 'wishAdd', [ that.getValue() ] );
            });

            // 添加tooltip
            this.descTrigger.tooltip();
        },

        getValue: function (){

            return {
                topic: this.topic.val(),
                description: this.description.val()
            };
        }

    };

    ShareWishView.init();
})();
