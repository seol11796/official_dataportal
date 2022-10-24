var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer({ dest: "uploadedFiles/" });
var Post = require("../models/Post");
var User = require("../models/User");
var File = require("../models/File");
var util = require("../util");
var complexityService = require("../service/complexityService");
var finedustService = require("../service/finedustService");

// direct request
router.get("/", function (req, res) {
  res.render("maps/index");
});

//serch
router.get("/:stationName", async function (req, res) {
  complex = await complexityService.getComplexity(req.params.stationName);
  finedust = await finedustService.getFinedust(req.params.stationName);
  res.render("stations/index");
});

// showing route
router.get("/:startStationName/:endStaionName", function (req, res) {
  res.render("maps/index");
});

module.exports = router;

// private functions
function checkPermission(req, res, next) {
  Post.findOne({ numId: req.params.id }, function (err, post) {
    if (err) return res.json(err);
    if (post.author != req.user.id) return util.noPermission(req, res);

    next();
  });
}

async function createSearchQuery(queries) {
  var searchQuery = {};
  if (
    queries.searchType &&
    queries.searchText &&
    queries.searchText.length >= 3
  ) {
    var searchTypes = queries.searchType.toLowerCase().split(",");
    var postQueries = [];
    if (searchTypes.indexOf("title") >= 0) {
      postQueries.push({
        title: { $regex: new RegExp(queries.searchText, "i") },
      });
    }
    if (searchTypes.indexOf("body") >= 0) {
      postQueries.push({
        body: { $regex: new RegExp(queries.searchText, "i") },
      });
    }
    if (searchTypes.indexOf("author!") >= 0) {
      var user = await User.findOne({ username: queries.searchText }).exec();
      if (user) postQueries.push({ author: user._id });
    } else if (searchTypes.indexOf("author") >= 0) {
      var users = await User.find({
        username: { $regex: new RegExp(queries.searchText, "i") },
      }).exec();
      var userIds = [];
      for (var user of users) {
        userIds.push(user._id);
      }
      if (userIds.length > 0) postQueries.push({ author: { $in: userIds } });
    }
    if (postQueries.length > 0) searchQuery = { $or: postQueries };
    else searchQuery = null;
  }
  return searchQuery;
}
