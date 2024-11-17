'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Attachments", "metadata", {
      type: Sequelize.JSON,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Attachments", "metadata");
  },
};
