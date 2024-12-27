'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        console.log(queryInterface, Sequelize);
        // await queryInterface.addColumn("Articles", "deletedAt", {
        //   type: Sequelize.DATE,
        // });
        // await queryInterface.addIndex("Articles", {
        //   fields: ["deletedAt"],
        // });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Articles', 'deletedAt');
    },
};
