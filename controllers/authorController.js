const Book = require('../models/book');
const Author = require('../models/author');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

//Display a list of all the authors
exports.author_list = asyncHandler(async (req, res, next) => {
	const allAuthors = await Author.find({}).sort({ family_name: 1 }).exec();
	res.render('author_list', {
		title: 'Author List',
		author_list: allAuthors,
	});
});

// Display detail page for a specific author
exports.author_detail = asyncHandler(async (req, res, next) => {
	const [author, allBooksByAuthor] = await Promise.all([
		Author.findById(req.params.id).exec(),
		Book.find({ author: req.params.id }, 'title summary').exec(),
	]);

	if (author === null) {
		//no results
		const err = new Error('Author not found');
		err.status = 404;
		return next(err);
	}

	res.render('author_detail', {
		title: 'Author Detail',
		author: author,
		author_books: allBooksByAuthor,
	});
});

// Display Author create form on GET
exports.author_create_get = asyncHandler(async (req, res, next) => {
	res.render('author_form', { title: 'Create Author' });
});

//Handle author create on POST
exports.author_create_post = [
	// Validate and sanitize fields.
	body('first_name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('First name must be specified')
		.isAlphanumeric()
		.withMessage('First name has non-alphanumeric characters.'),

	//
	body('family_name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('Family name must be specified.')
		.isAlphanumeric()
		.withMessage('Family name has non-alphanumeric characters.'),

	//
	body('date_of_birth', 'Invalid date of birth')
		.optional({ values: 'falsy' })
		.isISO8601()
		.toDate(),

	//
	body('date_of_death', 'Invalid date of death')
		.optional({ values: 'falsy' })
		.isISO8601()
		.toDate(),

	// Process request after validation and sanitization.
	asyncHandler(async (req, res, next) => {
		//extract the validation errors
		const errors = validationResult(req);

		// Create Author object with escaped and trimmed data
		const author = new Author({
			first_name: req.body.first_name,
			family_name: req.body.family_name,
			date_of_birth: req.body.date_of_birth,
			date_of_death: req.body.date_of_death,
		});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/error messages.
			res.render('author_form', {
				title: 'Create Author',
				author: author,
				errors: errors.array(),
			});
			return;
		} else {
			// Data from form is valid.

			// Save the new author
			await author.save();
			// Redirect to new author record.
			res.redirect(author.url);
		}
	}),
];

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
	// Get the details of the author and all their books, in parallel
	const [author, allBooksByAuthor] = await Promise.all([
		Author.findById(req.params.id).exec(),
		Book.find({ author: req.params.id }, 'title summary').exec(),
	]);

	if (author === null) {
		//no results
		res.redirect('/catalog/authors');
	}
	res.render('author_delete', {
		title: 'Delete Author',
		author: author,
		author_books: allBooksByAuthor,
	});
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
	// Get the details of the author and all their books, in parallel
	const [author, allBooksByAuthor] = await Promise.all([
		Author.findById(req.params.id).exec(),
		Book.find({ author: req.params.id }, 'title summary').exec(),
	]);

	if (allBooksByAuthor.lenght > 0) {
		//Author has books. Render in the same way as for GET route.
		res.render('author_delete', {
			title: 'Delete Author',
			author: author,
			author_books: allBooksByAuthor,
		});
		return;
	} else {
		//Author has no books. Delete object and redirect to the list of authors.
		await Author.findByIdAndDelete(req.body.authorid);
		res.redirect('/catalog/authors');
	}
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
	const author = await Author.findById(req.params.id).exec();
	if (author === null) {
		//no result
		const err = new Error('Author not found');
		return next(err);
	}

	res.render('author_form', {
		title: 'Update Author',
		author: author,
	});
});

// Handle Author update on POST.
exports.author_update_post = [
	// Validate and sanitize the fields
	body('first_name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('First name must be specified')
		.isAlphanumeric()
		.withMessage('First name has non-alphanumeric characters.'),

	//
	body('family_name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('Family name must be specified.')
		.isAlphanumeric()
		.withMessage('Family name has non-alphanumeric characters.'),

	//
	body('date_of_birth', 'Invalid date of birth')
		.optional({ values: 'falsy' })
		.isISO8601()
		.toDate(),

	//
	body('date_of_death', 'Invalid date of death')
		.optional({ values: 'falsy' })
		.isISO8601()
		.toDate(),

	//Update the entry after validation and sanitization
	asyncHandler(async (req, res, next) => {
		//Extract the validation errors from the request.
		const errors = validationResult(req);

		// Create a bookinstance object with escaped/trimmed data and old id
		const newAuthor = new Author({
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			date_of_birth: req.body.date_of_birth,
			date_of_death: req.body.date_of_death,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			// There are errors
			// Re-render the form with sanitized values and errors messages
			const author = await Author.findById(req.params.id).exec();
			if (author === null) {
				//no result
				const err = new Error('Author not found');
				return next(err);
			}
			res.render('author_form', {
				title: 'Update Author',
				author: author,
				errors: errors.array(),
			});
			return;
		} else {
			//find and update
			const author = await Author.findByIdAndUpdate(
				req.params.id,
				newAuthor,
				{}
			);
			//Redirect to the updated author page.
			res.redirect(author.url);
		}
	}),
];
