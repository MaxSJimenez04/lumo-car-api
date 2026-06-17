const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');

class Vehiculo extends Model{
    static associate(models){
        Vehiculo.belongsTo(models.Sucursal, {foreignKey: 'idSucursal'})
        Vehiculo.belongsTo(models.Color, {foreignKey: 'idColor'})
        Vehiculo.belongsTo(models.Marca, {foreignKey: 'idMarca'})
        Vehiculo.belongsToMany(models.Usuario, {through: models.Renta, foreignKey: 'idVehiculo'})
        Vehiculo.hasMany(models.Archivo, {foreignKey: 'idVehiculo'})
    }
}

Vehiculo.init(
    {
        id:{
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        placa:{
            type: DataTypes.STRING(9),
            allowNull: false
        },
        modelo:{
            type: DataTypes.STRING,
            allowNull: false
        },
        pasajeros:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        transmision:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        tamano:{
            type: DataTypes.STRING(1),
            allowNull: false
        },
        tipo_combustible:{
            type: DataTypes.CHAR(1),
            allowNull: false
        },
        aire_acondicionado:{
        type: DataTypes.BOOLEAN 
        },
        estado:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idColor:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idMarca:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idSucursal:{
            type: DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        sequelize,
        modelName: 'Vehiculo',
        tableName:'Vehiculo'
    }
);

module.exports = Vehiculo;