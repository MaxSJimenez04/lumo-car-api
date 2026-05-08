const {DataTypes, Model, INTEGER} = require('sequelize');
const sequelize = require('../config/db');

class Renta extends Model{
    static associate(models){
        Renta.belongsTo(models.Usuario, {foreignKey: 'idUsuario'})
        Renta.belongsTo(models.Vehiculo,{foreignKey: 'idVehiculo'})
        Renta.hasMany(models.Notificacion, {foreignKey: 'idRenta'})
        Renta.hasOne(models.Pago, {foreignKey: 'idRenta', onDelete: 'CASCADE'})
    }
}

Renta.init(
    {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        fechaInicio:{
            type: DataTypes.DATE,
            allowNull: false
        },
        fechaFin:{
            type:DataTypes.DATE,
            allowNull: false
        },
        estadoRenta:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idUsuario:{
            type: DataTypes.UUID,
            allowNull: false
        },
        idVehiculo:{
            type: DataTypes.UUID,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName:'Renta',
        tableName:'Renta'
    }
);

module.exports = Renta;