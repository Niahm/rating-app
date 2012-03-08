var redis = require('redis'),
    cli = redis.createClient(6379, '127.0.0.1'),
    _ = require('underscore'),
    stores = [];

exports.set = function(key, value, expire){
    cli.set(key,value);

    if(_(stores).indexOf(key) === -1){
        cli.expire(key, 1);
        stores.push(key);
    }else{
        if(key && typeof expire !== 'undefined'){
            cli.expire(key, expire);
        }
    };
};

exports.get = function(key, fn){
    //force clear cache on start up
    if(_(stores).indexOf(key) == -1){
        cli.expire(key, 1);
        stores.push(key);
        return fn(null,null)
    }

    //var d = +new Date();
    cli.get(key, function(err,value){
        //console.log('cache get:', +new Date() - d);
        fn && fn(err,value);
    });
};
