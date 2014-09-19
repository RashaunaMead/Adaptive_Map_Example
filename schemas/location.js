var mongoose = require('mongoose');

module.exports = mongoose.model('Location', {
	id: String,
	time: Number,
	lat: Number,
	lng: Number,
	type: String,
	info: String,
	date_created: { type: Date, default: Date.now }
});



