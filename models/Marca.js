const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');

class Marca extends Model{
    static associate(models){
        Marca.hasMany(models.Vehiculo, {foreignKey: 'idMarca'})
    }
}

Marca.init(
    {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        nombreMarca:{
            type: DataTypes.STRING,
            allowNull: false
        }
    },

    {
        sequelize,
        modelName:'Marca',
        tableName:'Marca'
    }
);

module.exports = Marca;