/**
 *  错误
 */
var util = require('util');

var NotFound = exports.NotFound = function(msg){
    this.name = 'NotFound';
    Error.call(this,msg);
    Error.captureStackTrace(this, arguments.callee);
}
util.inherits(NotFound, Error);
NotFound.prototype.statusCode = 400;

/*
 * 权限不足
 */
var NoPermission = exports.NoPermission =  function(msg){
    this.name = 'NoPermission';
    Error.call(this,msg);
    Error.captureStackTrace(this, arguments.callee);
}
util.inherits(NoPermission, Error);
NoPermission.prototype.status = 401;

exports.errorHandle = function(err, req, res, next){
    if(err instanceof NotFound){
        res.render('404',{
            title : 404
           ,navtab : ''
        });
    } else if(err instanceof NoPermission){
        res.send({
            errors : [{type:'没有权限!'}]
        });
    } else{
        next(err);
    }
};
