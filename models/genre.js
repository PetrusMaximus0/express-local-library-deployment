const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GenreSchema = new Schema({
	name: { type: String, required: true, min: 3, max: 100 },
});

//Virtual for the genre's URL
GenreSchema.virtual('url').get(function () {
	return `/catalog/genre/${this._id}`;
});

//Export the model
module.exports = mongoose.model('Genre', GenreSchema);
