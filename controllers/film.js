const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const {models} = require("../models");
const cloudinary = require('cloudinary');
const fs = require('fs');
const attHelper = require("../helpers/attachments");

const paginate = require('../helpers/paginate').paginate;

// Optios for the files uploaded to Cloudinary
const cloudinary_upload_options = {
    async: true,
    folder: "/core/quiz2018/attachments",
    resource_type: "auto",
    tags: ['core', 'quiz']
};

// Autoload the film with id equals to :filmId
exports.load = (req, res, next, filmId) => {

    const options = {
        include: [
            models.attachment,
            {model: models.user, as: 'author'}
        ]
    };

    // For logged in users: include the favourites of the question by filtering by
    // the logged in user with an OUTER JOIN.
    

    models.film.findById(filmId, options)
    .then(film => {
        if (film) {
            req.film = film;
            next();
        } else {
            throw new Error('There is no quiz with id=' + quizId);
        }
    })
    .catch(error => next(error));
};


// MW that allows actions only if the user logged in is admin or is the author of the quiz.
exports.adminOrAuthorRequired = (req, res, next) => {

    const isAdmin  = !!req.session.user.isAdmin;
    const isAuthor = req.quiz.authorId === req.session.user.id;

    if (isAdmin || isAuthor) {
        next();
    } else {
        console.log('Prohibited operation: The logged in user is not the author of the quiz, nor an administrator.');
        res.send(403);
    }
};


// GET /quizzes
exports.index = (req, res, next) => {

    let countOptions = {
        where: {},
        include: []
    };


    let title = "Questions";

    // Search:
    const search = req.query.search || '';
    if (search) {
        const search_like = "%" + search.replace(/ +/g,"%") + "%";

        countOptions.where.question = { [Op.like]: search_like };

    }
      

    models.film.count(countOptions)
    .then(count => {

        // Pagination:

        const items_per_page = 10;

        // The page to show is given in the query
        const pageno = parseInt(req.query.pageno) || 1;

        // Create a String with the HTMl used to render the pagination buttons.
        // This String is added to a local variable of res, which is used into the application layout file.
        res.locals.paginate_control = paginate(count, items_per_page, pageno, req.url);

        const findOptions = {
            ...countOptions,
            offset: items_per_page * (pageno - 1),
            limit: items_per_page
        };

        findOptions.include.push(models.attachment);
        findOptions.include.push({
            model: models.user,
            as: 'author'
        });

        return models.film.findAll(findOptions);
    })
    .then(films => {

        res.render('films/index.ejs', {
                    films,
                    search,
                    cloudinary,
                    title
                });

        
    })
    .catch(error => next(error));
};


// GET /quizzes/:quizId
exports.show = (req, res, next) => {

    const {film} = req;

    res.render('films/show', {
                    film,
                    cloudinary
                });
    
};


// GET /quizzes/new
exports.new = (req, res, next) => {

    const film = {
        question: "",
        answer: ""
    };

    res.render('films/new', {film});
};

// POST /quizzes/create
exports.create = (req, res, next) => {

    const {question, answer} = req.body;


    const film = models.film.build({
        question,
        answer
    });

    // Saves only the fields question and answer into the DDBB
    film.save({fields: ["question", "answer"]})
    .then(film => {
        req.flash('success', 'Pregunta de cine guardada.');

        if (!req.file) {
            req.flash('info', 'Pregunta sin archivo asociado.');
            res.redirect('/films/' + film.id);
            return;
        }

        // Save the attachment into  Cloudinary
        return attHelper.checksCloudinaryEnv()
        .then(() => {
            return attHelper.uploadResourceToCloudinary(req.file.path, cloudinary_upload_options);
        })
        .then(uploadResult => {

            // Create the new attachment into the data base.
            return models.attachment.create({
                public_id: uploadResult.public_id,
                url: uploadResult.url,
                filename: req.file.originalname,
                mime: req.file.mimetype,
                filmId: film.id })
            .then(attachment => {
                req.flash('success', 'Video guardado.');
            })
            .catch(error => { // Ignoring validation errors
                req.flash('error', 'Fallo al guardar video: ' + error.message);
                cloudinary.api.delete_resources(uploadResult.public_id);
            });

        })
        .catch(error => {
            req.flash('error', 'Failed to save attachment: ' + error.message);
        })
        .then(() => {
            fs.unlink(req.file.path); // delete the file uploaded at./uploads
            res.redirect('/films/' + film.id);
        });
    })
    .catch(Sequelize.ValidationError, error => {

        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('films/new', {film});
    })
    .catch(error => {

        req.flash('error', 'Error creating a new film: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/edit
exports.edit = (req, res, next) => {

    const {film} = req;

    res.render('films/edit', {film});
};


// PUT /quizzes/:quizId
exports.update = (req, res, next) => {

    const {film, body} = req;

    film.question = body.question;
    film.answer = body.answer;

    film.save({fields: ["question", "answer"]})
    .then(film => {
        req.flash('success', 'Quiz edited successfully.');

        if (!body.keepAttachment) {

            // There is no attachment: Delete old attachment.
            if (!req.file) {
                req.flash('info', 'This quiz has no attachment.');
                if (film.attachment) {
                    cloudinary.api.delete_resources(film.attachment.public_id);
                    film.attachment.destroy();
                }
                return;
            }

            // Save the new attachment into Cloudinary:
            return attHelper.checksCloudinaryEnv()
            .then(() => {
                return attHelper.uploadResourceToCloudinary(req.file.path, cloudinary_upload_options);
            })
            .then(function (uploadResult) {

                // Remenber the public_id of the old image.
                const old_public_id = film.attachment ? film.attachment.public_id : null;

                // Update the attachment into the data base.
                return film.getAttachment()
                .then(function(attachment) {
                    if (!attachment) {
                        attachment = models.attachment.build({ quizId: film.id });
                    }
                    attachment.public_id = uploadResult.public_id;
                    attachment.url = uploadResult.url;
                    attachment.filename = req.file.originalname;
                    attachment.mime = req.file.mimetype;
                    return attachment.save();
                })
                .then(function(attachment) {
                    req.flash('success', 'Image saved successfully.');
                    if (old_public_id) {
                        cloudinary.api.delete_resources(old_public_id);
                    }
                })
                .catch(function(error) { // Ignoring image validation errors
                    req.flash('error', 'Failed saving new image: '+error.message);
                    cloudinary.api.delete_resources(uploadResult.public_id);
                });


            })
            .catch(function(error) {
                req.flash('error', 'Failed saving the new attachment: ' + error.message);
            })
            .then(function () {
                fs.unlink(req.file.path); // delete the file uploaded at./uploads
            });
        }
    })
    .then(function () {
        res.redirect('/films/' + req.film.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('films/edit', {film});
    })
    .catch(error => {
        req.flash('error', 'Error editing the Quiz: ' + error.message);
        next(error);
    });
};


// DELETE /quizzes/:quizId
exports.destroy = (req, res, next) => {

    // Delete the attachment at Cloudinary (result is ignored)
    if (req.film.attachment) {
        attHelper.checksCloudinaryEnv()
        .then(() => {
            cloudinary.api.delete_resources(req.film.attachment.public_id);
        });
    }

    req.film.destroy()
    .then(() => {
        req.flash('success', 'Quiz deleted successfully.');
        res.redirect('/goback');
    })
    .catch(error => {
        req.flash('error', 'Error deleting the Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/play
exports.play = (req, res, next) => {

    const {film, query} = req;

    const answer = query.answer || '';


        res.render('films/play', {
            film,
            answer,
            cloudinary
        });
   
};


// GET /quizzes/:quizId/check
exports.check = (req, res, next) => {

    const {film, query} = req;

    const answer = query.answer || "";
    const result = answer.toLowerCase().trim() === film.answer.toLowerCase().trim();

    res.render('films/result', {
        film,
        result,
        answer
    });
};