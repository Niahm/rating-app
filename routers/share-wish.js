/**
 * 许愿墙
 */
require( '../modules/share-wish' );
var mongoose = require( 'mongoose' );
var ShareWishModel = mongoose.model( 'shareWish' );

var ShareWish = {

    /**
     * 添加心愿
     * post方法
     * @param req
     * @param res
     */
    add: function ( req, res ){

        var data = req.body;
        var newWish = {
            topic: data.topic,
            description: data.description,
            owner: data.description
        };

        ModelHandle.add( newWish, function ( err, newWish ){

            if( err ){

                res.send({
                    result: false,
                    error: err,
                    msg: '添加心愿出错'
                });
            }
            else {

                res.send({
                    result: true,
                    error: undefined,
                    msg: undefined,
                    data: newWish.toJSON()
                });
            }
        });
    },

    /**
     * 获取心愿
     * get
     * @param req
     * @param res
     */
    get: function ( req, res ){

        var data = req.query;
        var id = data.id;
        var queryObj = {};
        var field;
        var fieldValue;

        for( field in data ){

            fieldValue = data[ field ];

            switch( field ){

                case 'id':
                case 'achieve':
                case 'owner':
                case 'response':
                    queryObj[ field ] = fieldValue;
                    break;

                case 'title':
                    queryObj[ field ] = {
                        $regex: new RegExp( fieldValue )
                    };
                    break;
                default:
                    break;
            }
        }

        ModelHandle.get( queryObj, function ( err, wishes ){

            if( err ){

                res.send({
                    result: false,
                    error: err,
                    msg: '添加心愿出错'
                });
            }
            else {

                var result = [];
                wishes.forEach( function ( wish ){

                    result.push( wish.toJSON() );
                });

                res.send({
                    result: true,
                    error: undefined,
                    msg: undefined,
                    data: result
                });
            }
        });
    }
};

var ModelHandle = {

    /**
     * 添加心愿
     * @param wish {
     *  topic:
     *  description:
     *  owner:
     * }
     * @param next( err, wish )
     */
    add: function ( wish, next ){

        wish.date = Date.now();

        var newWish = new ShareWishModel( wish );

        newWish.save( next );
    },

    /**
     * 删除心愿
     * @param query {Object} mongoDB query条件对象
     * @param next ( err, wishes )
     */
    remove: function ( query, next ){

        ShareWishModel.query( query, function ( err, wishes ){

            if( err ){

                next( err );
            }
            else {

                var len = wishes.length;
                var count = 0;
                var ifError = false;

                wishes.forEach(function ( wish ){

                    wish.remove( function ( err ){

                        count++;

                        if( ifError === true ){

                            return;
                        }
                        else {

                            if( err ){

                                ifError = true;
                                next( err );
                            }
                            else {

                                if( count === len ){

                                    next( undefined, wishes );
                                }
                            }
                        }
                    });
                });

                if( count === len ){

                    next( undefined, wishes );
                }
            }
        });
    },

    /**
     * 修改心愿
     * @param query {Object} mongoDB query对象
     * @param updateObj
     * @param next (err, wishes )
     */
    update: function ( query, updateObj, next ){

        ShareWishModel.query( query, function ( err, wishes ){

            if( err ){

                next( err );
            }
            else {

                var len = wishes.length;
                var count = 0;
                var ifError = false;

                wishes.forEach(function ( wish ){

                    var attr;

                    for( attr in updateObj ){

                        wish[ attr ] = updateObj[ attr ];
                    }

                    wish.save( function ( err ){

                        count++;

                        if( ifError === true ){

                            return;
                        }
                        else {

                            if( err ){

                                ifError = true;
                                next( err );
                            }
                            else {

                                if( count === len ){

                                    next( undefined, wishes );
                                }
                            }
                        }
                    });
                });

                if( count === len ){

                    next( undefined, wishes );
                }
            }
        });
    },

    /**
     * 心愿搜索
     * @param query
     * @param next
     */
    get: function ( query, next ){

        ShareWishModel.find( query, next );
    }
};

module.exports = ShareWish;