/**
 * 许愿箱中的单个愿望
 * @type {*}
 */
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var ShareWish = exports.Schema =  new Schema({
    // 期待的话题主题
    topic: { type: String, required: true, unique: true },
    // 许愿者
    owner: { type: String, default: 'somebody' },
    // 对于话题的详细描述
    description: { type: String  },
    // 对该话题的响应者
    response: { type: String },
    // 该愿望是否已经实现
    achieve: { type: Boolean, require: true, default: false },
    // 时间
    date: { type: Date }
});

mongoose.model('shareWish', ShareWish);
