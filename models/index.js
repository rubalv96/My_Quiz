const path = require('path');

// Load ORM
const Sequelize = require('sequelize');


// To use SQLite data base:
//    DATABASE_URL = sqlite:quiz.sqlite
// To use  Heroku Postgres data base:
//    DATABASE_URL = postgres://user:passwd@host:port/database

const url = process.env.DATABASE_URL || "sqlite:quiz.sqlite";

const sequelize = new Sequelize(url);

// Import the definition of the Quiz Table from quiz.js
sequelize.import(path.join(__dirname, 'quiz'));

// Import the definition of the Tips Table from tip.js
sequelize.import(path.join(__dirname,'tip'));

// Import the definition of the Users Table from user.js
sequelize.import(path.join(__dirname,'user'));

// Session
sequelize.import(path.join(__dirname,'session'));

//Puntuaciones
sequelize.import(path.join(__dirname,'puntuacion'));

// Relation between models

const {quiz, tip} = sequelize.models;

tip.belongsTo(quiz);
quiz.hasMany(tip);


//Relaciones entre puntuaciones y quiz
const points = sequelize.models.puntuacion;

points.belongsTo(quiz);
quiz.hasMany(points);


module.exports = sequelize;
