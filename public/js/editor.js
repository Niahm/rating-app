$(function(){
    var editor = ace.edit("textarea");
    editor.setTheme("ace/theme/twilight");
    var MarkDownMode = require("ace/mode/markdown").Mode;
    var session = editor.getSession()
    session.setMode(new MarkDownMode)
    session.setUseWrapMode(true)
    session.setWrapLimitRange(80,80);
    session.setValue($('#source').val());

    function postContent(save){
        save = save?'1':'';
        $.ajax({
            type : 'POST',
            url : '/share/' + g_config.shareId + '/content',
            data : {
                preview : 1,
                content : session.getValue(),
                save : save
            },
            dataType : 'json'
        }).success(function(data){
            $('#preview').html(data.html);
        }).error(function(e){
            console.log(e);
        });
    }

    $('body').delegate('#previewBtn','click', function(ev){
        postContent(false);

    }).delegate('#saveBtn','click', function(ev){
        postContent(true);
    });

});
