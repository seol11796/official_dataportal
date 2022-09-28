var mongoose = require('mongoose');
var Counter = require('./Counter');

// schema
var applicationSchema = mongoose.Schema({
  title:{type:String, required:[true,'Title is required!']},
  body:{type:String, required:[true,'Body is required!']},
  author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
  views:{type:Number, default:0},
  numId:{type:Number},
  createdAt:{type:Date, default:Date.now},
  updatedAt:{type:Date},
});

applicationSchema.pre('save', async function (next){
  var application = this;
  if(application.isNew){
    counter = await Counter.findOne({name:'application'}).exec();
    if(!counter) counter = await Counter.create({name:'application'});
    counter.count++;
    counter.save();
    application.numId = counter.count;
  }
  return next();
});

// model & export
var Application = mongoose.model('application', applicationSchema);
module.exports = Application;