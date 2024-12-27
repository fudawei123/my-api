'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        console.log(queryInterface, Sequelize);
        // await queryInterface.addColumn("Courses", "free", {
        //   allowNull: false,
        //   defaultValue: true,
        //   type: Sequelize.BOOLEAN,
        // });
        // await queryInterface.addColumn("Chapters", "free", {
        //   allowNull: false,
        //   defaultValue: true,
        //   type: Sequelize.BOOLEAN,
        // });
        // await queryInterface.addIndex("Courses", {
        //   fields: ["free"],
        // });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Courses', 'free');
        await queryInterface.removeColumn('Chapters', 'free');
    },
};
