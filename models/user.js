const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// Define the User schema object
let userSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: true
	},
	email: {
		type: String,
		trim: true,
		required: true,
		uniquie: true
	},
	password: {
		type: String,
		required: true
	},
	profile: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User