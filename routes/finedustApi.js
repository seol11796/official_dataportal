var express = require("express");
var router = express.Router();
var finedustService = require("../service/finedustService");

// finedust 결과 그대로 리턴
router.get("/all", async function (req, res) {
  res.json(await finedustService.getAll());
});

// finedust 결과 역별 리턴
router.get("/station/:stationName", async function (req, res) {
  res.json(await finedustService.getStation(req.params.stationName));
});

// finedust 결과 좋음/보통/나쁨 값 리턴
router.get("/value/:stationName", async function (req, res) {
  res.json(await finedustService.getValue(req.params.stationName));
});

module.exports = router;
