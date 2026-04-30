const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');

class Rol extends Model{
    static associate(models){
        Rol.hasMany(models.Usuario)
    }
}

Rol.init(
    {
       idRol:{
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
       },
       nombreRol:{
        type: DataTypes.STRING,
        allowNull: false
       }
    },
    {
        sequelize,
        modelName:'Rol',
        tableName:'Rol'
    }
);

module.exports = Rol;