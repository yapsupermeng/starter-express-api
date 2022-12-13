const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const sourceChannel = process.env.SOURCE_CHANNEL
const secretEncoding = process.env.SECRET_ENCODING
const AccModel = require('./../models/account');
module.exports = class API {
	static async getOtp(req, res) {
		var result = { success: false, src: '', ascii: '' }
		try {
			//Search if username is taken
			req.body.username = 'req.body.username'
			var foundDoc = await new Promise((resolve, reject) => {
				AccModel.findOne({ username: req.body.username }, function (err, doc) {
					if (err) reject(err)
					resolve(doc)
				})
			})
			if (foundDoc) throw "Error: Account already exists with this username!"
			if (!req.body.username) throw "Missing username"

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
				name: '2FA-Demo'
			})
			result.ascii = secret[secretEncoding];
			result.src = await qrcode.toDataURL(secret.otpauth_url)
			result.success = true
			console.log(secret);
		}
		catch (e) {
			console.log(e)
		}
		res.json(result)
	}

	static async signup(req, res) {
		var result = { success: false, src: '', ascii: '' }
		try {

			//Search if username is taken
			var foundDoc = await new Promise((resolve, reject) => {
				AccModel.findOne({ username: req.body.username }, function (err, doc) {
					if (err) reject(err)
					resolve(doc)
				})
			})
			if (foundDoc) throw "Error: Account already exists with this username!"

			if (!req.body.username) throw "Missing username"
			if (!req.body.secret) throw "Missing secret"

			//Prepare data to save
			var accDoc = new AccModel()
			accDoc.username = req.body.username
			accDoc.secret = req.body.secret
			accDoc.encoding = secretEncoding
			accDoc.source = sourceChannel
			//Save to database
			await new Promise((resolve, reject) => {
				accDoc.save(function (e) {
					if (e) reject(e)
					resolve()
				})
			})
		}//end try
		catch (e) {
			if (typeof e === "string") result.reason = e
			else {
				result.reason = "Server error"
				console.log(e)
			}
		}//end catch
		res.json(result)
	}

	static async verify(req, res) {
		console.log('verify');
		//body format 
		//    json = {
		//     secret: CustomStorage.getItem("2FA"),
		//     token: inputCurrent,
		//   };
		var body = req.body;
		console.log(body);
		var result;
		try {
			body.encoding = secretEncoding;
			result = speakeasy.totp.verify(body);
		}
		catch (e) {
			console.log(e)
		}
		console.log(result);
		res.json(result)
	}

	static async delete(req, res) {
		console.log('verify');
		//body format 
		//    json = {
		//     secret: CustomStorage.getItem("2FA"),
		//     token: inputCurrent,
		//   };
		var body = req.body;
		console.log(body);
		var result = { success: false }
		try {
			let userName = body.userName;
			let sourceChannel = body.sourceChannel;
			let temp = await AccModel.findByIdAndDelete(userName);
			console.log("Deleted user: ", temp);
			result.success = true
		}
		catch (e) {
			console.log(e)
		}
		console.log(result);
		res.json(result)
	}
}