const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const {models} = require("../models");

// GET /quizzes
exports.index = (req, res, next) => {
    return models.film.findAll()
    .then(films => {
        res.render('films/index.ejs', {
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