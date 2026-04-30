const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');

class AdminSucursal extends Model{
    static associate(models){
        AdminSucursal.belongsTo(models.Usuario, {foreignKey: 'idUsuario'})
        AdminSucursal.belongsTo(models.Sucursal, {foreignKey:'idSucursal'})
    }
}

AdminSucursal.init(
    {
        idUsuario:{
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            references:{
                model:'Usuario',
                key:'id'
            }
        },
        idSucursal:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references:{
                model:'Sucursal',
                key:'id'
            }
        }
    },
    {
        sequelize,
        modelName: 'AdminSucursal',
        tableName: 'Admin_Sucursal'
    }
)

module.exports = AdminSucursal;