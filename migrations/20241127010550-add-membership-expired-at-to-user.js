'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        console.log(queryInterface, Sequelize);
        // await queryInterface.addColumn("Users", "membershipExpiredAt", {
        //   type: Sequelize.DATE,
        // });
        // await queryInterface.addIndex("Users", {
        //   fields: ["membershipExpiredAt"],
        // });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Users', 'membershipExpiredAt');
    },
};
