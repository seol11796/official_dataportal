function getStationName(stationName) {
  const last = stationName.charAt(stationName.length - 1);
  if (last == "역") {
    stationName = stationName.slice(0, -1);
    if (stationName == "서울") {
      stationName = stationName + "역";
    }
    return stationName;
  } else if (stationName == "서울") {
    stationName = stationName + "역";
    return stationName;
  } else {
    return stationName;
  }
}

module.exports = {
  getStationName,
};
