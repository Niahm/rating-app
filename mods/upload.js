/**
 * middleware 上传管理
 */

var modules = require('../modules/');
var File = modules.File;
module.exports = function(req,res,next){
    //上传列表
    if(!req.files){
        next();
        return;
    }
    _(req.files).each(function(oFile){
        if(oFile.size === 0){
            return;
        }
        oFile.path = oFile.path.replace(/^.*\/public\/upload/,'/upload')
        var file = new File({
            name : oFile.name
           ,size : oFile.size
           ,path : oFile.path
           ,type : oFile.type
           ,uploader : req.loggedIn?req.user._id : null
        });
        file.save();
    });
    next();
}
