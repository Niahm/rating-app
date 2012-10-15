/*jslint devel: false, node: true, passfail: true, nomen: true, maxerr: 50, indent: 4 */
/**
 * Module dependencies.
 */
'use strict';

var express = require('express');

var _ = require("underscore");
var resource = require('express-resource');
var RedisStore = require('connect-redis')(express);
var moment = require('moment');


var developmod = false;

var everyauth = require('./mods/auth').everyauth;
var upload = require('./mods/upload');
var tags = require('./mods/tags');
var cache = require('./mods/cache');

var app = module.exports = express.createServer();

//Modules

var errors = require('./mods/errors');

function redirect(req, res, next) {
    if (req.param('redirect')) {
        req.session.redirectTo = req.param('redirect');
        return next();
    }
    next();
}

app.configure(function () {
    //app.use(express.logger());
    app.use(express.static(__dirname + '/public'));
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser({
        uploadDir: __dirname + '/public/upload',
        keepExtensions : true
    }));
    app.use(express.cookieParser('xxaefasd;fjasd;fj'));
    app.use(express.session({
            secret: "supershare!",
            cookie : {
                maxAge: 1000*60*60*24*1000
            },
            store: new RedisStore
    }));
    app.use(redirect);
    app.use(everyauth.middleware());
    app.use(express.methodOverride());
    app.use(upload);
    app.use(app.router);

    //个性错误处理
    app.error(errors.errorHandle);
});

app.configure('development', function(){
    developmod  = true;
    app.error(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.error(express.errorHandler())
    app.set("view cache", true);
});




// Routes
/**
 * 首页
 */
app.get('/', function(req, res){
  if(req.session.goto){
    res.redirect(req.session.goto)
    delete req.session.goto;
    return;
  }
  res.render('index/index', {
    layout : 'layout-index',
    title: '分享平台'
   ,navtab : 'home'
  });
});

/**
 * 日历
 */
app.get('/calendar', function(req,res){
  res.render('calendar', {
    layout : 'layout-calendar'
   ,title: '分享会日历'
   ,navtab : 'shareset'
  });
});

/**
 * 发现分享
 */
app.get('/explore', function(req,res){
  res.render('explore', {
    layout : 'layout-explore'
   ,title: '发现分享'
   ,navtab : 'explore'
  });
});

/**
 * 平台反馈页面
 */
app.get('/feedback', function(req, res){
  res.render('index/feedback', {
    title: '反馈与讨论 分享平台'
   ,navtab : 'feedback'
  });
});

/**
 * 异步获取全部标签
 */
app.get('/json/tags', function(req, res,next){
    var data;

    cache.get(req.url, function(err, value){
        if(err) return next(err);

        if(value){
            data = JSON.parse(value)
            if(data){
                res.send(data);
                return;
            }
        }

        tags.getTags(function(err,docs){
            if(err) return next(err);
            res.send(docs);
            //更新cache
            cache.set(req.url, JSON.stringify(docs), 60 * 60 * 6);
        });
    });
});

app.get('/test',function(req,res){
    res.render('test',{
        title : 'json tool'
    });
});

var sharesetResource = app.resource('shareset', require('./routers/shareset'));

_(require('./routers/shareset-plus')).each(function(fn, path){
    if(typeof fn === 'object'){
        _(fn).each(function(cb, method){
            sharesetResource.map(method,path,cb);
        });
    }else if(typeof fn === 'function'){
        sharesetResource.map('get', path, fn);
    }
});

var shareResource = app.resource('share', require('./routers/share'));

_(require('./routers/share-plus')).each(function(fn, path){

    if(typeof fn === 'object'){
        _(fn).each(function(cb, method){
            shareResource.map(method,path,cb);
        });
    }else if(typeof fn === 'function'){
        shareResource.map('get', path, fn);
    }

});



app.post('/uploadmgr',function(req,res){
    res.partial('uploaded', {
        files : req.files
    });
});




app.get('/user/edit',function(req,res){
    res.render('auth/edit', {
        title : '修改用户名',
        user : req.user
    });
});

app.post('/user/edit',function(req,res){
    var user = req.user,
        name = req.param('name');

    user.name = name;
    user.save(function(err, user){
        if(err) return next(err);
        res.render('auth/edit', {
            title : '修改成功!',
            user : req.user
        });
    });

});

/**
 * 心愿墙 路由
===============================*/
var ShareWish = require( './routers/share-wish.js' );

app.get( '/sharewish', function ( req, res ){

    res.render( 'sharewish/share-wish', {
        layout: 'layout-share-wish',
        title: '心愿墙',
        navtab: 'sharewish'
    });
})

app.get( '/sharewish/get', function ( req, res ){

    ShareWish.get( req, res );
});

app.post( '/sharewish/add', function ( req, res ){

    ShareWish.add( req, res );
});


app.get('/404', function(req,res,next){
    throw new errors.NotFound;
});

app.get('/500', function(req,res,next){
    var error = new Error();
    error.title = 500
    throw error;
});

/**
 * helpers for view
 */
app.helpers({
    moment : moment,
    developmod  : developmod,
    timestamp : '20120326',
    ts: function (name){
        var defaultTimestamp = 'none';
        var timestamps = {
            'wish': '20120718',
            'index': '20120718',
            'calendar': '20120718',
            'shareset': '20120718',
            'common': '20120718'
        };
        return timestamps[name] || defaultTimestamp;
    },
    commonTimestamp: '20120306',
});

everyauth.helpExpress(app);

app.listen(8000);
console.log('server started on 8000...');
