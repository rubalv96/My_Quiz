module.exports = function (sequelize, DataTypes) {
    return sequelize.define('film',
        {
            name: {
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "Name of film must not be empty"}}
            },
            director: {
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "Author must not be empty"}}
            },
            category: {
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "Category must not be empty"}}
            }
        });
};