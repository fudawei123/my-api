'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED
      },
      courseId: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED
      },
      parentId: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      replyId: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      address: {
        type: Sequelize.STRING
      },
      likesCount: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER.UNSIGNED
      },
      text: {
        type: Sequelize.TEXT
      },
      textType: {
        allowNull: false,
        defaultValue: 'text',
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex("Comments", {
      fields: ["userId"],
    });
    await queryInterface.addIndex("Comments", {
      fields: ["courseId"],
    });
    await queryInterface.addIndex("Comments", {
      fields: ["replyId"],
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Comments');
  }
};