
var mongoose = require('mongoose');
var helper = require('./helper')
var Schema   = mongoose.Schema;

var ShareSetSchema = new Schema({
  // 本期主题
  subject : {
      'type'    : String
     ,'required' : true
  },
  //分享会名称
  name : {
    'type' : String
   ,'required' : true
   ,'default' : ''
  }
  // 创建时间
 ,ts : {
    'type' : Date
   ,'default' : Date.now
 }
 ,date : {
    'type' : Date
   ,'required' : true
 }
 ,startTime : {
    'type' : String
   ,'default' : ''
   ,'validate' : [/^\d{1,2}\:\d{1,2}$/,'需要设置时间']
   ,'required' : true
 }
 ,endTime : {
   'type' : String
   ,'default' : ''
   ,'validate' : [/^\d{1,2}\:\d{1,2}$/,'需要设置时间']
   ,'required' : true
 }
 ,position : {
    'type' : String
   ,'default' : ''
   ,'required' : true
 }
  //  简介
 ,desc : {
   'type' : String
  ,'default' : ''
  }
  // 创建者
 ,owner : {
    'type' : Schema.ObjectId
   ,'ref' : 'user'
   ,'required' : true
 }
 //分享会url shortname
 ,postname : {
   'type' : String,
   'required' : true,
   'validate' : [/^[0-9a-zA-Z\_\-]+$/, '个性地址只能包含字母，数字，- 或"_']
 }
 //分享会类别
 ,category : {
    'type' : String
 }
 //标记
 ,deleted : {
    'type' : Boolean,
    'default' : false
 }
 ,shares : [ { type: Schema.ObjectId, ref: 'share' } ]
});

mongoose.model('shareset', ShareSetSchema);
