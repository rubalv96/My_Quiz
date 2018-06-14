const path = require('path');

// Load ORM
const Sequelize = require('sequelize');

// Para usar SQLite data base:
// DATABASE_URL = sqlite:quiz.sqlite
//Para usar Heroku Postgres data base;
// DATABASE_URL = postgres://user:passwd@host:port/database



const url = process.env.DATABASE_URL || "sqlite:quiz.sqlite";

if(url === process.env.DATABASE_URL){
    console.log("Uso pg");
}


if(url === "sqlite:quiz.sqlite"){
    console.log("uso sqlite");
}
const sequelize = new Sequelize(url);

// Import the definition of the Quiz Table from quiz.js
sequelize.import(path.join(__dirname, 'quiz'));

// Import the definition of the Tips Table from tip.js
sequelize.import(path.join(__dirname,'tip'));

// Import the definition of the Users Table from user.js
sequelize.import(path.join(__dirname,'user'));

// Import the definition of the Attachments Table from attachment.js
sequelize.import(path.join(__dirname,'attachment'));

// Session
sequelize.import(path.join(__dirname,'session'));

// peliculas
sequelize.import(path.join(__dirname,'film'));


// Relation between models

const {quiz, tip, attachment, user, film} = sequelize.models;

tip.belongsTo(quiz);
quiz.hasMany(tip);

// Relation 1-to-N between User and Quiz:
user.hasMany(quiz, {foreignKey: 'authorId'});
quiz.belongsTo(user, {as: 'author', foreignKey: 'authorId'});

// Relation 1-to-1 between Quiz and Attachment
attachment.belongsTo(quiz);
quiz.hasOne(attachment);

// Relation 1-to-1 between Quiz and User:
//    A User has many favourite quizzes.
//    A quiz has many fans (the users who have marked it as favorite)
quiz.belongsToMany(user, {
    as: 'fans',
    through: 'favourites',
    foreignKey: 'quizId',
    otherKey: 'userId'
});

user.belongsToMany(quiz, {
    as: 'favouriteQuizzes',
    through: 'favourites',
    foreignKey: 'userId',
    otherKey: 'quizId'
});


//Relacion 1 a 1 entre films y attachments

attachment.belongsTo(film);
film.hasOne(attachment);


//Relación 1 a N entre users y quiz
user.hasMany(film, {foreignKey: 'authorId'});
film.belongsTo(user, {as: 'author', foreignKey: 'authorId'});



// Relation 1-to-N between User and Tips:
user.hasMany(tip, {foreignKey: 'authorId'});
tip.belongsTo(user, {as: 'author', foreignKey: 'authorId'});
//Importamos la definicion de sesiones (la tabla)
sequelize.import(path.join(__dirname,'session'));
// Create tables
sequelize.sync()
.then(() => console.log('Data Bases created successfully'))
.catch(error => {
    console.log("Error creating the data base tables:", error);
    process.exit(1);
});


module.exports = sequelize;
