var mongoose = require('mongoose');
var Counter = require('./Counter');

// schema
var usageSchema = mongoose.Schema({
  title:{type:String, required:[true,'Title is required!']},
  body:{type:String, required:[true,'Body is required!']},
  author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
  views:{type:Number, default:0},
  numId:{type:Number},
  attachment:{type:mongoose.Schema.Types.ObjectId, ref:'file'},
  createdAt:{type:Date, default:Date.now},
  updatedAt:{type:Date},
});

usageSchema.pre('save', async function (next){
  var usage = this;
  if(usage.isNew){
    counter = await Counter.findOne({name:'posts'}).exec();
    if(!counter) counter = await Counter.create({name:'posts'});
    counter.count++;
    counter.save();
    usage.numId = counter.count;
  }
  return next();
});

// model & export
var Usage = mongoose.model('usage', usageSchema);
module.exports = Usage;
