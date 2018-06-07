'use strict';

module.exports = {
    up(queryInterface, Sequelize) {

        return queryInterface.bulkInsert('films', [
            {
                name: 'E.T: El extraterrestre',
                director: 'Steven Spielberg',
                category: 'Ciencia Ficción',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down(queryInterface, Sequelize) {

        return queryInterface.bulkDelete('films', null, {});
    }
};
