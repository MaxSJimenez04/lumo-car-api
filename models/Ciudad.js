const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');

class Ciudad extends Model{
    static associate(models){
        Ciudad.belongsTo(models.Estado, {foreignKey: 'idEstado'})
        Ciudad.hasMany(models.Sucursal, {foreignKey: 'idCiudad'})
    }
}

Ciudad.init(
    {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey:  true,
            autoIncrement: true
        },

        nombreCiudad:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        idEstado:{
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName:'Ciudad',
        tableName:'Ciudad'
    }
);

module.exports = Ciudad;