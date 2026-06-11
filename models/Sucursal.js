const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');

class Sucursal extends Model{
    static associate(models){
        Sucursal.belongsTo(models.Ciudad, {foreignKey: 'idCiudad'}) 
        Sucursal.hasMany(models.Vehiculo, {foreignKey: 'idSucursal'})
        Sucursal.hasMany(models.Usuario, {foreignKey: 'idSucursal'})
    }
}

Sucursal.init(
    {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey:  true,
            autoIncrement: true,
        },
        nombre:{
            type: DataTypes.STRING,
            allowNull: false
        },
        direccion:{
            type: DataTypes.STRING(1000),
            allowNull: false
        },
        latitud:{
            type:DataTypes.DECIMAL(9,6),
            allowNull:false
        },
        longitud:{
            type: DataTypes.DECIMAL(9,6),
            allowNull: false
        },
        capacidad:{
            type: DataTypes.INTEGER
        },
        idCiudad:{
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName:'Sucursal',
        tableName:'Sucursal'
    }
);

module.exports = Sucursal;