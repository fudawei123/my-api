'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Post extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Post.belongsTo(models.Category, {
                foreignKey: 'category_id',
                as: 'category',
            });
        }
    }
    Post.init(
        {
            category_id: DataTypes.INTEGER,
            name: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'Post',
            tableName: 'my_api_posts', // 指定表名
            timestamps: false, // 不需要时间
        }
    );
    return Post;
};
