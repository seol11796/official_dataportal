const s3_config = require("../config/s3Config.json");
const fs = require("fs");
const AWS = require("aws-sdk");

const bucket_name = s3_config.bucket_name;
const access_key = s3_config.access_key;
const secret_key = s3_config.secret_key;

// S3 객체
const S3 = new AWS.S3({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: access_key,
    secretAccessKey: secret_key,
  },
});

// 파일 업로드
async function upload(stationName) {
  var object_name = stationName + ".PNG";
  var local_file_path = "./mapPictures/" + stationName + ".PNG";
  await S3.putObject({
    Bucket: bucket_name,
    Key: object_name,
    ACL: "public-read",
    Body: fs.createReadStream(local_file_path),
  }).promise();
}

// 파일 다운로드
async function download(stationName) {
  var object_name = stationName + ".PNG";
  var local_file_path = "./mapPictures/" + stationName + ".PNG";
  AWS.config.update({
    accessKeyId: access_key,
    sercetAccessKey: secret_key,
  });
  let outStream = fs.createWriteStream(local_file_path);
  let inStream = S3.getObject({
    Bucket: bucket_name,
    Key: object_name,
  }).createReadStream();

  inStream.pipe(outStream);
  inStream.on("end", () => {});

  return local_file_path;
}

module.exports = {
  upload,
  download,
};
