
// Definition of the Films model:

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('film',
        {
            question: {
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "Question must not be empty"}}
            },
            answer: {
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "Answer must not be empty"}}
            }
        });
};