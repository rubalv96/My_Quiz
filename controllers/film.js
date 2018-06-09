const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const {models} = require("../models");


// Autoload the film with id equals to :filmId
exports.load = (req, res, next, filmId) => {

    models.film.findById(filmId)
    .then(film => {
        if (film) {
            req.film = film;
            next();
        } else {
            throw new Error('There is no film with id=' + filmId);
        }
    })
    .catch(error => next(error));
};
// GET /quizzes
exports.index = (req, res, next) => {
     models.film.findAll()
    .then(films => {
        res.render('films/index', {
            films
        });
    })
    .catch(error => next(error));
};

// GET /quizzes/new
exports.new = (req, res, next) => {

    const film = {
        name: "", 
        director: "",
        category: ""
    };

    res.render('films/new', {film});
};

exports.show = (req, res, next) =>{
    const {film} = req;

    res.render('films/show', {film});
}

exports.create = (req, res, next) =>{
    const {name, director, category} = req.body;

    const film = models.film.build({
        name,
        director,
        category
    });

    // Saves only the fields question and answer into the DDBB
    film.save({fields: ["name", "director", "category"]})
    .then(film => {
        req.flash('success', 'Pelicula guardada.');
        res.redirect('/films/' + film.id + '/show');
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'Error en el fomrulario:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('films/new', {film});
    })
    .catch(error => {
        req.flash('error', 'Error guardando la nueva película: ' + error.message);
        next(error);
    });
};


// DELETE /quizzes/:quizId
exports.destroy = (req, res, next) => {

    req.film.destroy()
    .then(() => {
        req.flash('success', 'Film deleted successfully.');
        res.redirect('/films');
    })
    .catch(error => {
        req.flash('error', 'Error deleting the film: ' + error.message);
        next(error);
    });
};
