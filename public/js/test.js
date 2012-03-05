define(function(require, exports, module){
    var $ = require('jquery');

    exports.loadjson = function(url){
        $.ajax({
            url : url,
            dataType : 'json',
            success : function(d){
                console.log(d)
            }
        });
    };
});
