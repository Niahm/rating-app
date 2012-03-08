var redis = require('redis'),
    client = redis.createClient(),
    async = require('async')
    modules = require('../modules/'),
    _ = require('underscore'),
    stores = {};


var Share = modules.Share,
    ShareSet = modules.ShareSet;

client.on('error',function(err){
    throw new Error(err);
});

exports.getTags = function(fn){
    //var d = +new Date();
    Share.distinct('tags', {deleted:{$ne : true}}, function(err, tags){
        if(err) return fn(err);
        async.map(tags, function(tag, cb){
            Share.count({tags : tag}, function(err, count){
                if(err) return cb(err);
                cb(null, {
                    tag : tag,
                    count : count
                });
            });
        }, function(err, results){
            //console.log('db:', +new Date() - d);
            if(err) return fn(err);
            fn(null, results);
        });
    });
};

exports.getNames = function(fn){
    ShareSet.distinct('name', {}, function(err, names){
        if(err) return fn(err);
        async.map(names, function(name, cb){
            ShareSet.count({name : name}, function(err, count){
                if(err) return cb(err);
                cb(null, {
                    name : name,
                    count : count
                })
            });
        }, function(err, results){
            if(err) return fn(err);
            fn(null, results);
        });
    });
};
