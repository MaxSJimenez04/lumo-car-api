const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');

class SuscripcionUsuario extends Model{
    static associate(models){
        SuscripcionUsuario.belongsTo(models.Usuario,{ foreignKey: 'idUsuario'})
        SuscripcionUsuario.belongsTo(models.Suscripcion, {foreignKey: 'idSuscripcion'})
        SuscripcionUsuario.hasMany(models.Notificacion, {foreignKey: 'idSuscripcionUsuario'})
    }
}

SuscripcionUsuario.init(
    {
        idUsuario:{
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        idSuscripcion:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        estado:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        fechaInicio:{
            type: DataTypes.DATE,
            allowNull: false
        },
        fechaFin:{
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName:'SuscripcionUsuario',
        tableName:'Suscripcion_Usuario'
    }
);

module.exports = SuscripcionUsuario;