'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Attachments', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER.UNSIGNED,
            },
            userId: {
                allowNull: false,
                type: Sequelize.INTEGER.UNSIGNED,
            },
            originalname: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            filename: {
                type: Sequelize.STRING,
            },
            mimetype: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            size: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            path: {
                type: Sequelize.STRING,
            },
            fullpath: {
                type: Sequelize.STRING,
            },
            url: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            metadata: {
                type: Sequelize.JSON,
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
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Attachments');
    },
};
