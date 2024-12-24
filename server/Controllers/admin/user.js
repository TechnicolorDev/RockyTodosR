// models/user.js
const { sequelize, DataTypes, Model } = require("../../database/database");
const { Role } = require("./roles");
const crypto = require('crypto');

class User extends Model {}

User.init(
    {
        userId: {
            type: DataTypes.STRING(8),
            allowNull: false,
            unique: true,
            defaultValue: () => crypto.randomBytes(4).toString('hex'),
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        roleId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: Role,
                key: 'roleId',
            },
        },
        resetToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        resetTokenExpires: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },
    {
        sequelize,
        modelName: 'User',
        timestamps: true,
    }
);

User.belongsTo(Role, { foreignKey: 'roleId' });

module.exports = { User };
