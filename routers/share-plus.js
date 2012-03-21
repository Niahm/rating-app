var modules = require('../modules/');
var markdown = require('node-markdown').Markdown;
var Post = modules.Post;

//上传封面
exports['upload-cover'] = {
    get : function(req, res){
        res.render('share/cover-upload', {
            title : 'Upload Cover'
           ,share : req.share
           ,backurl : req.header('Referer')
           ,navtab : 'share'
        });
    },
    post : function(req, res){
        var share = req.share,
            files;

        if(!req.files){
            return res.redirect('back');
        }


        files = req.files;

        if(!files.cover){
            res.redirect('back');
            return;
        }

        share.cover = files.cover.path;

        share.save(function(err, saved){
            res.render('share/cover-upload',{
                title : '上传'
               ,share : saved
               ,navtab : 'share'
               ,backurl : req.param('backurl')
            });
        });
    }
};

// 分享内容编辑
exports.content = {
    post : function(req,res){
        var so = req.param('content')
            //过滤标签
           ,so_cache = markdown(so, true ,'a|b|blockquote|code|del|dd|dl|dt|em|h1|h2|h3|'+
            'i|img|li|ol|p|pre|sup|sub|strong|strike|ul|br|hr|iframe|embed', {
                'img': 'src|width|height|alt',
                'iframe' : 'src|width|height|frameborder|allowfullscreen',
                'embed' : 'src|wmode|width|height|allowscriptaccess|type|allowFullScreen|quality|align|mode',
                'a':   'href',
                '*':   'title'
           })
           ,post;

        req.share.content = so;
        req.share.contentHTML = so_cache;


        if(req.param('save')){
            //改动历史记录
            post = new Post({
                share : req.share._id
               ,source : so
               ,cached : so_cache
            });
            //缓存到分享的文档
            req.share.save(function(err,share){
                if(err) return req.next(err);
                post.save(function(err, p){
                    if(err) return req.next(err);
                    res.send({
                        html : so_cache
                    });;
                });
            });
        }else{
            //预览，直接发送
            res.send({
                html : so_cache
            });
        }

    }
};

exports.like = function(req,res){
    if(!req.session){
        res.send({ errors : [{type:"您已经投过票了"}]});
        return;
    }
    var liked = req.session.shareliked,
        share = req.share,
        shareId = req.params.share;

    if(!liked){
        liked = [];
    }
    if(liked.indexOf(shareId) !== -1){
        res.send({ errors : [{type:"您已经投过票了"}]});
        return;
    }

    share.like += 1;
    share.save(function(err, doc){
        if(err) return res.send({
            errors : err.errors || err
        });
        liked.push(shareId);
        req.session.shareliked = liked;
        res.send({
            errors : null,
            action : 'redirect',
            redirect : ''
        });
    });
};

exports.editor = function(req,res){
    res.render('share/editor', {
        layout : 'layout-editor',
        share : req.share,
        title : '编辑: ' + req.share.title
    });
}
