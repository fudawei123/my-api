'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate() {
            // define association here
        }
    }
    Comment.init(
        {
            userId: DataTypes.INTEGER,
            courseId: DataTypes.INTEGER,
            parentId: DataTypes.INTEGER,
            replyId: DataTypes.INTEGER,
            address: DataTypes.STRING,
            likesCount: DataTypes.INTEGER,
            text: DataTypes.TEXT,
            textType: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'Comment',
        }
    );
    return Comment;
};
