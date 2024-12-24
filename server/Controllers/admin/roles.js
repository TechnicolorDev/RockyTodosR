const { sequelize, DataTypes, Model } = require("../../database/database");
const { v4: uuidv4 } = require('uuid');

class Role extends Model {}

Role.init(
    {
        roleId: {
            type: DataTypes.STRING(36),
            allowNull: false,
            unique: true,
            primaryKey: true,
            defaultValue: uuidv4(),
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: { msg: 'Role name cannot be empty' },
                isAlphanumeric: { msg: 'Role name must be alphanumeric' },
            }
        },
    },
    {
        sequelize,
        modelName: 'Role',
        timestamps: false,
    }
);

const createDefaultRoles = async () => {
    try {
        await sequelize.sync();

        let adminRole = await Role.findOne({ where: { name: 'admin' } });
        if (!adminRole) {
            adminRole = await Role.create({ name: 'admin', roleId: uuidv4() });
            console.log('Admin role created');
        } else {
            console.log('Admin role already exists');
        }

        let userRole = await Role.findOne({ where: { name: 'user' } });
        if (!userRole) {
            userRole = await Role.create({ name: 'user', roleId: uuidv4() });
            console.log('User role created');
        } else {
            console.log('User role already exists');
        }
    } catch (error) {
        console.error('Error creating default roles:', error);
    }
};

createDefaultRoles();

module.exports = { Role };
