
var mongoose = require('mongoose');
const User = require('../models/User');


mongoose.connect(
    "mongodb+srv://seol:1218@cluster0.km1y7qr.mongodb.net/?retryWrites=true&w=majority"
  );

registerFavoriteService() {
    var user = new User();
    user.favorites.push("건대입구역");

    user.save(function(err,silece){

    if(err){

         cosole.log(err);

         return;

    }

    console.log(p);

    });

}