'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        console.log(queryInterface, Sequelize);
        // await queryInterface.addColumn("Users", "avatar", {
        //   type: Sequelize.STRING,
        // });
        // await queryInterface.changeColumn('Users', 'avatar', {
        //   type: Sequelize.STRING,
        //   allowNull: false,
        // });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Users', 'avatar');
    },
};
