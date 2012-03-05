
var mongoose = require('mongoose');
var helper = require('./helper')
var Schema   = mongoose.Schema;

var ShareSchema = new Schema({
  title : {
      'type' : String
     ,'set' : helper.trim
     ,'required':true
  }
 ,like : {
    'type' : Number,
    'default' : 0
 }
 ,cover : {
    'type' : String
   ,'default' : '/img/default-cover.png'
  }
 ,ts_save : {
      'type' : Date
     ,'default' : Date.now
     ,'required':true
 }
 ,deleted : {
      'type' : Boolean
     ,'default' : false
 }
 ,authors : {
     'type' : [String]
     ,'required':true
 }
 ,tags : {
     'type' : [String]
    ,set : helper.split
 }
 ,desc  : {
      'type' : String
     ,'default' : ''
  }
  //markdown
 ,content : {
      'type' : String
     ,'default' : ''
  }
  //parsed markdown
 ,contentHTML : {
      'type' : String
     ,'default' : ''
 }
 ,owner : {
      'type' : Schema.Types.ObjectId
     ,'required':true
     ,'ref' : 'user'
 }
 ,viewCount : {
    'type' : Number
   ,'default' : 0
 }

});

mongoose.model('share', ShareSchema);
