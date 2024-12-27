'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        console.log(queryInterface, Sequelize);
        // await queryInterface.addColumn('Orders', 'membershipMonths', {
        //   allowNull: false,
        //   defaultValue: 1,
        //   type: Sequelize.INTEGER.UNSIGNED
        // });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Orders', 'membershipMonths');
    },
};
