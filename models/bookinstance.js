const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema({
	//This is a reference to the associated book
	book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },

	imprint: { type: String, required: true },
	status: {
		type: String,
		required: true,
		enum: ['Available', 'Maintenance', 'Loaned', 'Reserverd'], //These are the allowed values
		default: 'Maintenance',
	},
	due_back: { type: Date, default: Date.now },
});

//Virtual for the bookinstance's URL
BookInstanceSchema.virtual('url').get(function () {
	//Using function instead of arrow function, so that we may use "this"
	return `/catalog/bookinstance/${this._id}`;
});

//Virtual to present a more readable date format
BookInstanceSchema.virtual('due_back_formatted').get(function () {
	return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

BookInstanceSchema.virtual('due_back_yyyy_mm_dd').get(function () {
	return DateTime.fromJSDate(this.due_back).toISODate(); // format yyyy-mm-dd
});

//Export the model
module.exports = mongoose.model('Bookinstance', BookInstanceSchema);
