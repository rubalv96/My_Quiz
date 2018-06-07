
// Definition of the Points model:

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('puntuacion',
        {
            text: {
                type: DataTypes.INTEGER,
                validate: {notEmpty: {msg: "La puntuación no debe estar vacía."}}
            }
        });
};