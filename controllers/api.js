const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const sourceChannel = process.env.SOURCE_CHANNEL;
const secretEncoding = process.env.SECRET_ENCODING;
const AccModel = require("./../models/account");
module.exports = class API {
  static async getOtp(req, res) {
    var result = { success: false, src: "" };
    try {
      //Search if username is taken
      req.body.username = "req.body.username";
      var foundDoc = await new Promise((resolve, reject) => {
        AccModel.findOne({ username: req.body.username }, function (err, doc) {
          if (err) reject(err);
          resolve(doc);
        });
      });
      if (foundDoc) throw "Error: Account already exists with this username!";
      if (!req.body.username) throw "Missing username";

      //Prepare data to save
      // var accDoc = new AccModel()
      // accDoc.username = 'req.body.username'
      // accDoc.secret = 'req.body.secret'
      // accDoc.encoding = 'secretEncoding'
      // accDoc.source = 'sourceChannel'
      // await new Promise((resolve, reject) => {
      // 	accDoc.save(function (e) {
      // 		if (e) reject(e)
      // 		resolve()
      // 	})
      // })

      //2FA code
      var secret = speakeasy.generateSecret({
        name: "2FA-Demo",
      });
      result.src = await qrcode.toDataURL(secret.otpauth_url);
      result.code = secret[secretEncoding];
      result.success = true;
      console.log(secret);
    } catch (e) {
      console.log(e);
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
        result.message = "Server error";
        console.log(e);
      }
    } //end catch
    res.json(result);
  }

  static async verify(req, res) {
    console.log("verify");
    var result = { success: false, message: "" };

    let username = req.body.username;
    let secret = "";
    var foundDoc = await new Promise((resolve, reject) => {
      AccModel.findOne({ username: username }, function (err, doc) {
        if (err) reject(err);
        resolve(doc);
      });
    });

    if (foundDoc) {
      secret = foundDoc.secret;
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
      console.log(e);
    }

    console.log(result);
    res.json(result);
  }

  static async delete(req, res) {
    console.log("delete");
    //body format
    //    json = {
    //     secret: CustomStorage.getItem("2FA"),
    //     token: inputCurrent,
    //   };
    var body = req.body;

    var result = { success: false, message: "" };
    let username = body.username;

    try {
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
      console.log("foundDoc");
      console.log(foundDoc);
      let temp = await AccModel.findByIdAndDelete(foundDoc._id);
      console.log("temp");
      console.log(temp);
      console.log("Deleted user: ", temp.username);
      result.success = true;
      (result.message = "Deleted user: "), temp.username;
    } catch (e) {
      result.message = "Unable to delete user collection";
      console.log(e);
    }
    console.log(result);
    res.json(result);
  }

  static async getStatus(req, res) {
    console.log("get status");
    var result = { success: false, secret: "", message: "" };
    var body = req.body;
    let username = body.username;
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
    res.json(result);
  }
};
