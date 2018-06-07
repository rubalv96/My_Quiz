module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable(
            'films',
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                name: {
                    type: Sequelize.STRING
                },
                director: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "Tip text must not be empty."}}
                },
                category: {
                    type: Sequelize.STRING
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                }
            },
            {
                sync: {force: true}
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('films');
    }
};
