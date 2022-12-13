var mongoose = require('mongoose')
const Schema = mongoose.Schema;
const tableName = process.env.TABLE_NAME

const AccountSchema = new Schema({
	username: {
		type: String,
		//index: true,
		required: true,
		unique: true,
	},
	secret: {
		type: String,
		required: true,
	},
	encoding: {
		type: String,
		required: true,
	},
	source: {
		type: String,
		required: true,
	},
}, {
	//collection: tableName,
	// versionKey: false
})

AccountSchema.index({ username: 1, source: 1 }, { unique: true });
module.exports = mongoose.model(tableName, AccountSchema);