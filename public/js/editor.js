$(function(){
    var editor = ace.edit("textarea");
    editor.setTheme("ace/theme/twilight");
    var MarkDownMode = require("ace/mode/markdown").Mode;
    var session = editor.getSession()
    var converter = new Showdown.converter();
    session.setMode(new MarkDownMode)
    session.setUseWrapMode(true)
    session.setWrapLimitRange(80,80);
    session.setValue($('#source').val());
    window.edi = editor;
    window.sn = session;

    window.uploadCallback = function(files){
        var file = files.uploader;
        var markdown = '';
        if(!file || file.size === 0 ){
            alert('请选择文件');
            return;
        }

        file.path = file.path.replace(/^public/,'');

        file.nameEscaped = file.name.replace(/([\.\-\+\#\`\_\*\\\{\}\(\)\[\]])/g,'\\$1');

        if(/^image/.test(file.type)){
            markdown = '!['+file.nameEscaped+']('+file.path+' "'+file.name+'")';
        }else{
            markdown = '上传的文件: ['+file.name+']('+file.path+')';
        }
        if(markdown){
            session.insert(editor.getCursorPosition(), markdown);
        }

    };

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
            if(save && confirm('保存成功鸟，现在回到分享首页？')){
                window.location.href = '/share/'+g_config.shareId
            }
        }).error(function(e){
            session.insert(editor.getCursorPosition(), markdown);
        });
    }

    $('body').delegate('#previewBtn','click', function(ev){
        postContent(false);
    }).delegate('#saveBtn','click', function(ev){
        postContent(true);
    });

    var actionmap = {
        image : function(ev){
            ev.preventDefault();
            var position = editor.getCursorPosition();
            session.insert(position, '![图片名](//url)');
            position.column += 2;
            editor.moveCursorToPosition(position);
            position.column += 3;
            editor.selection.selectToPosition(position);
            editor.focus();
        },
        link : function(ev){
            ev.preventDefault();
            var position = editor.getCursorPosition();
            session.insert(position, '[Text](//url)');
            position.column += 1;
            editor.moveCursorToPosition(position);
            position.column += 4;
            editor.selection.selectToPosition(position);
            editor.focus();
        },
        list : function(ev){
            ev.preventDefault();
            var position = editor.getCursorPosition();
            position.row++;
            position.column=0;
            session.insert(position, '  - \n');
            editor.moveCursorTo(position.row, 4);
            editor.focus();
        },

        upload : function(ev){
            ev.preventDefault();
            $('#upload-form').toggleClass('in');
        }
    }

    $('#editor-actions').delegate('[data-act]','click', function(ev){
        var et = $(this);
        var act = et.attr('data-act');
        var fn = actionmap[act]
        fn&&fn.call(this, ev);

    });

    editor.commands.addCommand({
        name: 'Save',
        bindKey: {
            win: 'Ctrl-S',
            mac: 'Command-S',
            sender: 'editor'
        },
        exec: function(env, args, request) {
            postContent(Y);
        }
    });
    editor.commands.addCommand({
        name: 'Preview',
        bindKey: {
            win: 'Ctrl-P',
            mac: 'Command-P',
            sender: 'editor'
        },
        exec: function(env, args, request) {
            postContent();
        }
    });
    //导致输入时，视频被不断刷新
    //session.on('change',function(ev){
        //var text = session.getValue();
        //var html = converter.makeHtml(text);
        //$('#preview').html(html);
        //return true;
    //});

});
