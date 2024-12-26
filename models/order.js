'use strict';
const { Model } = require('sequelize');
const moment = require('moment/moment');

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate(models) {
            models.Order.belongsTo(models.User, { as: 'user' });
        }
    }

    Order.init(
        {
            outTradeNo: DataTypes.STRING,
            tradeNo: DataTypes.STRING,
            userId: DataTypes.INTEGER,
            subject: DataTypes.STRING,
            totalAmount: DataTypes.DECIMAL,
            paymentMethod: DataTypes.TINYINT,
            status: DataTypes.TINYINT,
            membershipMonths: DataTypes.INTEGER,
            paidAt: {
                type: DataTypes.DATE,
                get() {
                    if (this.getDataValue('paidAt')) {
                        return moment(this.getDataValue('paidAt')).format('LL');
                    } else {
                        return null;
                    }
                },
            },
            version: {
                allowNull: false,
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            createdAt: {
                type: DataTypes.DATE,
                get() {
                    return moment(this.getDataValue('createdAt')).format('LL');
                },
            },
            updatedAt: {
                type: DataTypes.DATE,
                get() {
                    return moment(this.getDataValue('updatedAt')).format('LL');
                },
            },
        },
        {
            sequelize,
            modelName: 'Order',
            version: true, // 乐观锁
        }
    );
    return Order;
};
