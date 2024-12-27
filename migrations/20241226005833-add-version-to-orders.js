'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Orders', 'version', {
            allowNull: false,
            defaultValue: 0,
            type: Sequelize.INTEGER.UNSIGNED,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Orders', 'version');
    },
};
