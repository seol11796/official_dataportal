var api_config = require("../config/finedustApiConfig.json");
var request = require("request");
var xml2js = require("xml-js");

async function getFinedust(stationName) {
  authKey = api_config.authKey;

  geturl = finedustRequireURLResolver(authKey, stationName);
  res_xml = await getXml(geturl);

  var res_json = JSON.parse(
    xml2js.xml2json(res_xml, { compact: true, spaces: 4 })
  );

  var ret = new Object();

  ret.stationName = stationName;
  ret.PMq = res_json["airPolutionInfo"]["row"]["PMq"];
  ret.checkDate = res_json["airPolutionInfo"]["row"]["CHECKDATE"];

  return ret;
}

function getXml(url) {
  return new Promise(function (resolve, reject) {
    request(url, function (err, res, body) {
      if (!err && res.statusCode == 200) {
        resolve(body);
      } else {
        reject(err);
      }
    });
  });
}

function getStationNumber(stationName) {
  stationNumber = stationName;
  return 20;
}

function finedustRequireURLResolver(key, stationName) {
  base_url = api_config.base_url;

  start_station = getStationNumber(stationName);
  end_station = getStationNumber(stationName);

  return base_url + start_station + "/" + end_station;
}

module.exports = {
  getFinedust,
};
