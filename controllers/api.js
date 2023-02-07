const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const sourceChannel = process.env.SOURCE_CHANNEL;
const secretEncoding = process.env.SECRET_ENCODING;
const speakeasySecret = process.env.SPEAKEASY_SECRET;
const AccModel = require("./../models/account");
module.exports = class API {
  static async getOtp(req, res) {
    var result = { success: false, src: "" };
    try {
      if (!req.body.username) throw "Missing username";
      //Search if username is taken
      //req.body.username = 'req.body.username'
      var foundDoc = await new Promise((resolve, reject) => {
        AccModel.findOne({ username: req.body.username }, function (err, doc) {
          if (err) reject(err);
          resolve(doc);
        });
      });
      if (foundDoc) throw "Error: Account already exists with this username!";

      //2FA code
      var secret = speakeasy.generateSecret({
        name: speakeasySecret,
      });
      result.src = await qrcode.toDataURL(secret.otpauth_url);
      result.code = secret[secretEncoding];
      result.success = true;
      console.log(secret);
    } catch (e) {
      if (typeof e === "string") result.message = e;
      else {
        result.message = "Something went wrong!";
        console.log(e);
      }
    }
    res.json(result);
  }

  static async signup(req, res) {
    var result = { success: false, src: "" };
    try {
      if (!req.body.username) throw "Missing username";

      if (!req.body.secret) throw "Missing secret";
      const flag = speakeasy.totp.verify(json);
      if (flag != true) {
        throw "Invalid Token";
      }

      //Search if username is taken
      var foundDoc = await new Promise((resolve, reject) => {
        AccModel.findOne({ username: req.body.username }, function (err, doc) {
          if (err) reject(err);
          resolve(doc);
        });
      });
      if (foundDoc) throw "Error: Account already exists with this username!";

      var json = {
        secret: req.body.secret, //secret from db belong to the username
        encoding: secretEncoding,
        token: req.body.token, //6 digit token from API
      };
      console.log(json);
      var result;

      //Prepare data to save
      var accDoc = new AccModel();
      accDoc.username = req.body.username;
      accDoc.secret = req.body.secret;
      accDoc.encoding = secretEncoding;
      accDoc.source = sourceChannel;

      //Save to database
      await new Promise((resolve, reject) => {
        accDoc.save(function (e) {
          if (e) {
            reject(e);
          } else {
            console.log("successful signup");
            result.message = "";
            resolve();
          }
        });
      });
    } catch (e) {
      //end try
      if (typeof e === "string") result.message = e;
      else {
        result.message = "Something went wrong!";
      }
    } //end catch
    res.json(result);
  }

  static async verify(req, res) {
    var result = { success: false, message: "" };
    let secret = "";
    try {
      if (!req.body.username) throw "Missing username";
      if (!req.body.token || req.body.token == "") throw "Missing token";

      let username = req.body.username;

      var foundDoc = await new Promise((resolve, reject) => {
        AccModel.findOne({ username: username }, function (err, doc) {
          if (err) reject(err);
          resolve(doc);
        });
      });

      if (foundDoc) {
        secret = foundDoc.secret;
      } else {
        throw "Error: Account does not exists with this username!";
      }
    } catch (e) {
      console.log("err");
      if (typeof e === "string") result.message = e;
      else {
        result.message = "Something went wrong!";
        console.log(e);
      }
    } //end catch

    //param error
    if (result.message != "") {
      res.json(result);
      return;
    }

    var json = {
      secret: secret, //secret from db belong to the username
      encoding: secretEncoding,
      token: req.body.token, //6 digit token from API
    };
    console.log(json);
    var result;
    try {
      const flag = speakeasy.totp.verify(json);
      if (flag == true) {
        result.success = true;
        result.message = "";
      } else {
        result.success = false;
        result.message = "Invalid Token";
      }
    } catch (e) {
      result.message = "Unable to verify account!";
    }
    res.json(result);
  }

  static async delete(req, res) {
    console.log("delete");
    var result = { success: false, message: "" };
    try {
      if (!req.body.username) throw "Missing username";
      let username = req.body.username;
      var foundDoc = await new Promise((resolve, reject) => {
        AccModel.findOne(
          { username: username, source: sourceChannel },
          function (err, doc) {
            if (err) reject(err);
            resolve(doc);
          }
        );
      });

      if (!foundDoc) {
        throw "Error: Account does not exists with this username!";
      }
      console.log(foundDoc);
      let temp = await AccModel.findByIdAndDelete(foundDoc._id);
      result.success = true;
      result.message = "Deleted user: " + temp.username;
    } catch (e) {
      console.log("err");
      if (typeof e === "string") result.message = e;
      else {
        result.message = "Something went wrong!";
        console.log(e);
      }
    }
    console.log(result);
    res.json(result);
  }

  static async getStatus(req, res) {
    var result = { success: false, secret: "", message: "" };
    try {
      if (!req.body.username) throw "Missing username";
      let username = req.body.username;
      var foundDoc = await new Promise((resolve, reject) => {
        AccModel.findOne({ username: username }, function (err, doc) {
          if (err) reject(err);
          resolve(doc);
        });
      });

      if (!foundDoc) {
        result.secret = "";
        result.message = "Error: Account not exists with this username!";
      } else {
        result.success = true;
        result.secret = foundDoc.secret;
        result.message = "";
      }
    } catch (e) {
      if (typeof e === "string") result.message = e;
      else {
        result.message = "Something went wrong!";
      }
    }
    res.json(result);
  }
};
