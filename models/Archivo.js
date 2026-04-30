const {Model, DataTypes} = require('sequelize')
const sequelize = require('../config/db');

class Archivo extends Model{
    static associate(models){
        Archivo.belongsTo(models.Usuario,{foreignKey: 'idUsuario', as: 'propietario'})
        Archivo.belongsTo(models.Vehiculo,{foreignKey: 'idVehiculo', as: 'vehiculo'})
    }
}

Archivo.init(
    {
        id:{
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        nombreOriginal:{
            type: DataTypes.STRING,
            allowNull: false
        },
        nombreArchivo:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        ruta:{
            type: DataTypes.STRING,
            allowNull: false
        },
        esPrincipal:{
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        idUsuario:{
            type: DataTypes.UUID
        },
        idVehiculo:{
            type: DataTypes.UUID
        }
        
    },
    {
        sequelize,
        modelName: 'Archivo',
        tableName: 'Archivo'
    }
);

module.exports = Archivo;