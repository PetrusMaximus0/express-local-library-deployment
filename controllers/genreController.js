const Genre = require('../models/genre');
const Book = require('../models/book');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
	const allGenres = await Genre.find({}).sort({ name: 1 }).exec();
	res.render('genre_list', {
		title: 'Genre List',
		genre_list: allGenres,
	});
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
	//Get the details of the genre and all the associated books.
	const [genre, booksInGenre] = await Promise.all([
		Genre.findById(req.params.id).exec(),
		Book.find({ genre: req.params.id }, 'title summary').exec(),
	]);

	if (genre === null) {
		//no results found
		const err = new Error('Genre not found');
		err.status = 404;
		return next(err);
	}

	res.render('genre_detail', {
		title: 'Genre detail',
		genre: genre,
		genre_books: booksInGenre,
	});
});

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
	res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post = [
	//Validate and sanitize the name field.
	body('name', 'Genre name must contain at least 3 characers')
		.trim()
		.isLength({ min: 3 })
		.escape(),

	//Process request after validation and sanitization
	asyncHandler(async (req, res, next) => {
		//extract the validation errors from a request.
		const errors = validationResult(req);

		//create a genre object with escaped and trimmed data.
		const genre = new Genre({ name: req.body.name });

		if (!errors.isEmpty()) {
			//There are errors. Render the form again with sanitized values/error messages.
			res.render('genre_form', {
				title: 'Create Genre',
				genre: genre,
				errors: errors.array(),
			});
			return;
		} else {
			// Data from the form is valid
			// Check if Genre with the same name already exists
			const genreExists = await Genre.findOne({
				name: req.body.name,
			}).exec();
			if (genreExists) {
				// Genre exists, redirect to its detail page.
				res.redirect(genreExists.url);
			} else {
				await genre.save();
				// New genre saved. Redirect to the genre detail page
				res.redirect(genre.url);
			}
		}
	}),
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
	const [genre, allBooksInGenre] = await Promise.all([
		Genre.findById(req.params.id).exec(),
		Book.find({ genre: req.params.id }, 'title summary').exec(),
	]);

	if (genre === null) {
		//no results
		res.redirect('/catalog/genres');
	}

	res.render('genre_delete', {
		title: 'Delete Genre',
		genre: genre,
		allBooksInGenre: allBooksInGenre,
	});
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
	const [genre, allBooksInGenre] = await Promise.all([
		Genre.findById(req.params.id).exec(),
		Book.find({ genre: req.params.id }, 'title summary').exec(),
	]);

	if (allBooksInGenre.length > 0) {
		res.render('genre_delete', {
			title: 'Delete Genre',
			genre: genre,
			allBooksInGenre: allBooksInGenre,
		});
		return;
	}
	await Genre.findByIdAndDelete(req.params.id);
	res.redirect('/catalog/genres');
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
	const genre = await Genre.findById(req.params.id).exec();
	if (genre === null) {
		// no results
		const err = new Error("Couldn't find the genre to rename");
		err.status = 404;
		return next(err);
	}

	res.render('genre_form', {
		title: 'Rename Genre',
		genre: genre,
	});
});

// Handle Genre update on POST.
exports.genre_update_post = [
	//Validate and sanitize the name field.
	body('name', 'Genre name must contain at least 3 characers')
		.trim()
		.isLength({ min: 3 })
		.escape(),

	asyncHandler(async (req, res, next) => {
		//Sanitize and extract errors
		const errors = validationResult(req);

		//Create the new genre object
		const genre = new Genre({
			name: req.body.name,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			//There are errors
			//Redirect to the form with sanitized values and errors passed
			res.render('genre_form', {
				title: 'Rename genre',
				genre: genre,

				errors: errors.array(),
			});
			//return;
		} else {
			const newGenre = await Genre.findByIdAndUpdate(req.params.id, genre);
			res.redirect(newGenre.url);
		}
	}),
];
