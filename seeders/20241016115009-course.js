'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert(
            'Courses',
            [
                {
                    categoryId: 1,
                    userId: 1,
                    name: 'CSS 入门',
                    recommended: true,
                    introductory: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    categoryId: 2,
                    userId: 1,
                    name: 'Node.js 项目实践（2024 版）',
                    recommended: true,
                    introductory: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            {}
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('Courses', null, {});
    },
};
