const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const AuthorSchema = new mongoose.Schema({
	first_name: { type: String, required: true, maxLenght: 100 },
	family_name: { type: String, required: true, maxLenght: 100 },
	date_of_birth: { type: Date },
	date_of_death: { type: Date },
});

// Virtual for author's full name

AuthorSchema.virtual('name').get(function () {
	// To avoid errors in cases where an author does not have either a family or a first name
	// We want to make sure we handle the exception by returning an empty string for that case.
	let fullname = '';
	if (this.first_name && this.family_name) {
		fullname = `${this.family_name}, ${this.first_name}`;
	}
	return fullname;
});

// Virtual for author's URL
AuthorSchema.virtual('url').get(function () {
	// We don't use an arrow function, as we'll need to use the "this" object
	return `/catalog/author/${this._id}`;
});

// Virtual for authors date of death formatted
AuthorSchema.virtual('date_of_death_formatted').get(function () {
	return this.date_of_death
		? DateTime.fromJSDate(this.date_of_death).toLocaleString(
				DateTime.DATE_MED
		  )
		: '';
});

// Virtual for authors date of birth formatted
AuthorSchema.virtual('date_of_birth_formatted').get(function () {
	return this.date_of_birth
		? DateTime.fromJSDate(this.date_of_birth).toLocaleString(
				DateTime.DATE_MED
		  )
		: '';
});

// Virtual for authors date of death formatted
AuthorSchema.virtual('date_of_death_yyyy_mm_dd').get(function () {
	return this.date_of_death
		? DateTime.fromJSDate(this.date_of_death).toISODate()
		: '';
});

// Virtual for authors date of birth formatted
AuthorSchema.virtual('date_of_birth_yyyy_mm_dd').get(function () {
	return this.date_of_birth
		? DateTime.fromJSDate(this.date_of_birth).toISODate()
		: '';
});

module.exports = mongoose.model('Author', AuthorSchema);
