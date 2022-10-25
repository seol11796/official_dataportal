var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer({ dest: "uploadedFiles/" });
var Usage = require("../models/Usage");
var User = require("../models/User");
var File = require("../models/File");
var util = require("../util");

// get station information
router.get("/", async function (req, res) {
  complex = await complexityService.getComplexity(req.query.subway_name);
  finedust = await finedustService.getFinedust(req.query.subway_name);

  res.render("stations/about", {
    //"건대입구역" 등 '역'까지 포함한 형태
    station_name: req.query.subway_name,
    //숫자 하나 혹은 "x호선"으로 아직 결정 못함
    station_number: null,
    //쾌적, 적당, 복잡 중 하나
    complexity_state: null,
    //좋음, 보통, 나쁨 중 하나
    dust_state: null,
    //미정
    locker_location: null,
    //미정
    nearby_building: null,
  });
});

module.exports = router;

// private functions
function checkPermission(req, res, next) {
  Usage.findOne({ numId: req.params.id }, function (err, usage) {
    if (err) return res.json(err);
    if (usage.author != req.user.id) return util.noPermission(req, res);

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
