var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer({ dest: "uploadedFiles/" });
var Usage = require("../models/Usage");
var User = require("../models/User");
var File = require("../models/File");
var util = require("../util");


var complexityService = require("../service/complexityService");
var finedustService = require("../service/finedustService");

router.get("/", async function (req, res) {
  console.log(req.query.subway_name);
  complex = await complexityService.getComplexity(req.query.subway_name);
  finedust = await finedustService.getFinedust(req.query.subway_name);

  console.log(complex);

  res.render("maps/index", {
    station_name: req.query.subway_name,
    line_number: null,
    geton_mincpx: complex[0],
    geton_maxcpx: complex[1],
    getoff_mincpx: complex[2],
    getoff_maxcpx: complex[3],
    pm: null,
    locker_location: null,
    nearby_building: null,
    subway_image: null,
  });
});

//serch
router.get("/:stationName", async function (req, res) {
  complex = await complexityService.getComplexity(req.params.stationName);
  finedust = await finedustService.getFinedust(req.params.stationName);
  res.render("maps/index");
});

// showing route
router.get("/:startStationName/:endStaionName", function (req, res) {
  res.render("maps/index");
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
