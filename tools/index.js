
const AccModel = require('./../models/account');
module.exports = {
	initFunc: async () => {
		console.log('init function');
		try {
			//Search if username is taken
			var req = {
				username: 'req.body.username1',
				secret: 'req.body.secret',
				encoding: 'secretEncoding',
				source: 'sourceChannel'
			};
			//	req.username = 'req.body.username'
			var foundDoc = await new Promise((resolve, reject) => {
				AccModel.findOne({ username: req.username, source: req.source }, function (err, doc) {
					if (err) reject(err)
					resolve(doc)
				})
			})
			if (foundDoc) {
				console.log('foundDoc')
				console.log(foundDoc)
				let temp = await AccModel.findByIdAndDelete(foundDoc._id);
				console.log("Deleted user: ", temp);
				throw "Error: Account already exists with this username & source!"
			}


			if (!req.username) throw "Missing username"

			//Prepare data to save
			var accDoc = new AccModel()
			accDoc.username = 'req.body.username1'
			accDoc.secret = 'req.body.secret'
			accDoc.encoding = 'secretEncoding'
			accDoc.source = 'sourceChannel'
			await new Promise((resolve, reject) => {
				accDoc.save(function (e) {
					if (e) reject(e)
					resolve()
				})
			})
		}
		catch (e) {
			console.log('error')
			console.log(e)
		}
	},

};