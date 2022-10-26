var express = require("express");
var router = express.Router();
var complexityService = require("../service/complexityService");

// complexity 결과 그대로 리턴
router.get("/all", async function (req, res) {
  res.json(await complexityService.getAll());
});

// complexity 결과 역별 리턴
router.get("/station/:stationName", async function (req, res) {
  res.json(await complexityService.getStation(req.params.stationName));
});

// complexity 결과 가장 혼잡/쾌적 시간 상행/하행 별 리턴
router.get("/time/:stationName", async function (req, res) {
  res.json(await complexityService.getMostTime(req.params.stationName));
});

// complexity 결과 쾌적/보통/혼잡 리턴
router.get("/value/:stationName", async function (req, res) {
  res.json(await complexityService.getValue(req.params.stationName));
});

module.exports = router;
