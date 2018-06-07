const Sequelize = require("sequelize");
const {models} = require("../models");


// POST /quizzes/:quizId/points
exports.create = (req, res, next) => {
 
    const puntuacion1 = models.puntuacion.build(
        {
            text: req.body.puntuacion,
            quizId: req.quiz.id
        });

    console.log("Puntuación: " + req.body.puntuacion);
    console.log("quizId : "+ req.quiz.id);
    
    console.log("Id del points: " + puntuacion1.id);
    puntuacion1.save()
    .then(puntuacion1 => {
        req.flash('success', 'Puntuacion guardada satisfactoriamente.');
        res.redirect("back");
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.redirect("back");
    })
    .catch(error => {
        req.flash('error', 'Error creating the new points: ' + error.message);
        next(error);
    });
};
