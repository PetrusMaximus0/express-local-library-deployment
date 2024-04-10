const mongoose = require('mongoose');
const { DateTime } = require('luxon');
const Schema = mongoose.Schema;

const BookSchema = new Schema({
	title: { type: String, required: true },
	//this is a reference to an Author model object
	author: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
	summary: { type: String, required: true },
	isbn: { type: String, required: true },
	//this is a reference to an array of Genre model objects
	genre: [{ type: Schema.Types.ObjectId, ref: 'Genre' }],
});

//Virtual for book's URL
BookSchema.virtual('url').get(function () {
	//not using an arrow function in order to access "this"
	return `/catalog/book/${this._id}`;
});

//Virtual to present a more readable date format
BookSchema.virtual('due_back_formatted').get(function () {
	return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

//Export the model
module.exports = mongoose.model('Book', BookSchema);
