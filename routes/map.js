var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer({ dest: "uploadedFiles/" });
var Post = require("../models/Post");
var User = require("../models/User");
var File = require("../models/File");
var util = require("../util");

// direct request
router.get("/", function (req, res) {
  Promise.all([
    Post.findOne({ numId: req.params.id })
      .populate({ path: "author", select: "username" })
      .populate({ path: "attachment", match: { isDeleted: false } }),
  ])
    .then(([post]) => {
      post.views++;
      post.save();
      res.render("posts/show", { post: post });
    })
    .catch((err) => {
      return res.json(err);
    });
});

//serch
router.get("/:stationName", async function (req, res) {
  var page = Math.max(1, parseInt(req.query.page));
  var limit = Math.max(1, parseInt(req.query.limit));
  page = !isNaN(page) ? page : 1;
  limit = !isNaN(limit) ? limit : 10;

  var skip = (page - 1) * limit;
  var maxPage = 0;
  var searchQuery = await createSearchQuery(req.query);
  var posts = [];

  if (searchQuery) {
    var count = await Post.countDocuments(searchQuery);
    maxPage = Math.ceil(count / limit);
    posts = await Post.aggregate([
      { $match: searchQuery },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "files",
          localField: "attachment",
          foreignField: "_id",
          as: "attachment",
        },
      },
      {
        $unwind: {
          path: "$attachment",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          title: 1,
          author: {
            username: 1,
          },
          views: 1,
          numId: 1,
          attachment: {
            $cond: [
              { $and: ["$attachment", { $not: "$attachment.isDeleted" }] },
              true,
              false,
            ],
          },
          createdAt: 1,
        },
      },
    ]).exec();
  }
  if (req.isAuthenticated() && req.user.id == "633460883cdb84a4db9de691") {
    res.render("posts/adminIndex", {
      posts: posts,
      currentPage: page,
      maxPage: maxPage,
      limit: limit,
      searchType: req.query.searchType,
      searchText: req.query.searchText,
    });
  } else
    res.render("posts/index", {
      posts: posts,
      currentPage: page,
      maxPage: maxPage,
      limit: limit,
      searchType: req.query.searchType,
      searchText: req.query.searchText,
    });
});

// showing route
router.get("/:startStationName/:endStationName", function (req, res) {
  Promise.all([
    Post.findOne({ numId: req.params.id })
      .populate({ path: "author", select: "username" })
      .populate({ path: "attachment", match: { isDeleted: false } }),
  ])
    .then(([post]) => {
      post.views++;
      post.save();
      res.render("posts/show", { post: post });
    })
    .catch((err) => {
      return res.json(err);
    });
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
