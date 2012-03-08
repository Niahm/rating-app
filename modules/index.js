var mongoose = require('mongoose');
require('./user');
require('./file');
require('./post');
require('./feedback')
require('./shareset');
require('./share');
//ShareSetSchema.path('postname').validate(/^[0-9a-zA-Z\_\-]+$/, '个性地址只能包含字母，数字，- 或"_');

var db = mongoose.connect('mongodb://127.0.0.1/ratting');

exports.User = db.model('user');
exports.Share = db.model('share');
exports.ShareSet= db.model('shareset');
exports.File = db.model('file');
exports.Post = db.model('post');
exports.Feedback = db.model('feedback');
