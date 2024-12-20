"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      nickname: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      sex: {
        allowNull: false,
        defaultValue: 2,
        type: Sequelize.TINYINT.UNSIGNED,
        comment: "0为男性，1为女性，2为不选择。默认为：2",
      },
      company: {
        type: Sequelize.STRING,
      },
      introduce: {
        type: Sequelize.TEXT,
      },
      role: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.TINYINT.UNSIGNED,
        comment: "0为普通用户，100为管理员。默认为：0",
      },
      avatar: {
        type: Sequelize.STRING,
      },
      membershipExpiredAt: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addIndex("Users", {
      fields: ["email"], // 要索引的字段
      unique: true, // 唯一索引
    });
    await queryInterface.addIndex("Users", {
      fields: ["username"],
      unique: true,
    });
    await queryInterface.addIndex("Users", {
      fields: ["role"],
    });
    await queryInterface.addIndex("Users", {
      fields: ["email", "username"],
      unique: true,
    });
    await queryInterface.addIndex("Users", {
      fields: ["membershipExpiredAt"],
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
