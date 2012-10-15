var modules = require('../modules/');
var Feedback = modules.Feedback;
var Share = modules.Share;
var _ = require('underscore');
var moment = require('moment');
var ejs = require('ejs');
var jade = require('jade');
var path = require('path');

exports.addshares = {
    get : function(req, res, next){
        var shareset = req.shareset;
        var shares = req.param('shares');
        if(!shares) throw new Error('没有指定分享');
        shares = shares.split(',');
        //remove falsy
        //uniq
        _(shareset.shares).each(function(share){
            if(typeof share === 'object'){
                share = share._id;
            }
            shares.push(share);
        });

        shares = _.chain(shares).uniq().compact().value();

        shareset.shares = shares;
        shareset.save(function(err){
            if(err) return next(err);
            res.send({
                action : 'redirect',
                url : '/shareset/'+ shareset.postname
            });
        });
    }
};

exports.removeshare = function(req,res,next){
    debugger;
    var share = req.param('id');
    var shareset = req.shareset;
    var shares = _.filter(shareset.shares, function(s){
        return s._id.toString() !== share
    });

    shareset.shares = shares;
    shareset.save(function(err){
        if(err) return next(err);
        if(req.is('json')){
            res.send({
                action : 'redirect',
                url : '/shareset/'+ shareset.postname
            });
        }else{
            res.redirect('/shareset/'+shareset.postname);
        }
    });
};

//生成日历文件
exports.ics = function(req,res, next){
    /**
     * format date as UTC format as  '20000101T133000Z'
     * @param {Date|Moment} date object
     */
    function utcFormat(date){
        if(date.toDate){
            date = date.toDate();
        }
        var mo = moment(date);

        var timezoneOffset = date.getTimezoneOffset();
        var str = mo
            .add('minutes',timezoneOffset)
            .format('YYYYMMDDTHHmmssZ');
        return str;
    }

    /**
     * get of the array of hours and minutes from string '00:00'
     * @param {String} strTime
     * @return {Array}
     */
    function parseTime(strTime){
        var arr = strTime.split(':');
        if(arr.length < 2) return;

        return _(arr).map(function(d){
            return parseInt(d,10)
        });
    }

    var shareset = req.shareset
       ,date = shareset.date
       ,startTime =  parseTime(shareset.startTime)
       ,endTime  = parseTime(shareset.endTime)

       ,dtstart = moment(date.getTime())
            .hours(startTime[0])
            .minutes(startTime[1])

       ,dtend = moment(date.getTime())
            .hours(endTime[0])
            .minutes(endTime[1]);

    Share.find({shareset:shareset._id,deleted : {$ne : true}},function(err,shares){
        if(err)
            return next(err);
        var inviteCntJade = path.resolve(__dirname, '../views/invite-cnt.jade');
        var inviteEjs = path.resolve(__dirname, '../views/invite.ics.ejs');
        jade.renderFile(inviteCntJade, {
                shareset : shareset
               ,shares : shares
            },function(err,htmlcnt){
                if(err)
                    return next(err);
                ejs.renderFile(inviteEjs, {
                    shareset : req.shareset
                   ,dtstamp : utcFormat(new Date)
                   ,dtstart : utcFormat(dtstart)
                   ,cnt : htmlcnt.replace(/\n|\r\n/g,'')
                   ,dtend : utcFormat(dtend)
                },function(err,str){
                    if(err) return next(err);
                    res.send(str,{
                        'Content-Type':'text/calendar'
                       ,'Content-Disposition' : 'attachment; filename="' + shareset.subject + '.ics"'
                    }, 201);
                });
        });
    });
}

exports.feedback = {
    get : function(req,res){
        res.render('shareset/feedback', {
            layout : 'layout-feedback',
            shareset : req.shareset,
            title : '谢谢您的反馈'
        });
    },

    post : function(req,res){
        var body = req.body,
            shares = {},
            toshares = [];

        _(req.shareset.shares).each(function(v){
            shares[v._id] = v;
        });

        _(body.toshare).each(function(v,k){
            v.share = k;
            v.title = shares[k].title;
            v.authors = shares[k].authors.join(', ');
            toshares.push(v);
        });

        var fb = new Feedback({
            shareset : req.shareset._id,
            toShareset : body.toshareset,
            toShares : toshares
        });

        fb.save(function(err, saved){
            res.redirect('/shareset/'+req.shareset.postname+ '/feedback-success');
        });
    }
};

exports['feedback-success'] = function(req,res){
    res.render('shareset/feedback-success', {
        layout : 'layout-feedback',
        shareset : req.shareset,
        title : '谢谢您的反馈'
    });
};

exports.getfeedback = function(req,res){
    var shareset = req.shareset;
    Feedback.find({
        shareset : shareset._id
    }, function(err,docs){
        res.send({
            feedbacks : docs,
        });
    });
};

