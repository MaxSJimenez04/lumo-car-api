const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Notificacion extends Model {
    static associate(models) {
        Notificacion.belongsTo(models.Usuario, { foreignKey: 'idUsuario' })
        Notificacion.belongsTo(models.Renta, { foreignKey: 'idRenta' })
        Notificacion.belongsTo(models.SuscripcionUsuario, { foreignKey: 'idSuscripcionUsuario' })
    }
}

Notificacion.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        idUsuario: {
            type: DataTypes.UUID,
            allowNull: false
        },
        idRenta: {
            type: DataTypes.INTEGER
        },
        idSuscripcionUsuario: {
            type: DataTypes.INTEGER
        },
        titulo: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        mensaje: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        tipo: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        leida: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        fecha_envio: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'Notificacion',
        tableName: 'Notificacion',
        timestamps: false
    }
);

module.exports = Notificacion;