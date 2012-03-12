var modules = require('../modules/');
var markdown = require('node-markdown').Markdown;
var Post = modules.Post;

//上传封面
exports['upload-cover'] = {
    get : function(req, res){
        res.render('shareset/share-cover-upload', {
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
            res.render('shareset/share-cover-upload',{
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
           ,so_cache = markdown(so, false,'iframe|embed')
           ,post;

        req.share.content = so;
        req.share.contentHTML = so_cache;

        //for 历史记录
        post = new Post({
            share : req.share._id
           ,source : so
           ,cached : so_cache
        });

        req.share.save(function(err,share){
            if(err) return req.next(err);

            post.save(function(err, p){
                if(err) return req.next(err);
                res.send({
                    html : so_cache
                });;
            });

        });
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
