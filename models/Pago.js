const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');
class Pago extends Model{
    static associate(models){
        Pago.belongsTo(models.Tarjeta,{foreignKey: 'idTarjeta'});
        Pago.belongsTo(models.SuscripcionUsuario, {foreignKey: 'idSuscripcion', allowNull: true, onDelete: 'NO ACTION'})
        Pago.belongsTo(models.Renta, {foreignKey: 'idRenta', allowNull: true, onDelete: 'NO ACTION'})
    }
}

Pago.init(
    {
        idPago:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        monto:{
            type: DataTypes.DECIMAL(9,2),
            allowNull: false
        },
        fechaPago:{
            type: DataTypes.DATE,
            allowNull: false
        },
        concepto:{
            type: DataTypes.STRING
        },
        cvv:{
            type: DataTypes.CHAR(3),
            allowNull: true
        },
        idTarjeta:{
            type: DataTypes.UUID,
            allowNull: false,
        },
        idSuscripcion:{
            type: DataTypes.INTEGER
        },
        idRenta:{
            type: DataTypes.INTEGER
        }
    },
    {
        sequelize,
        modelName: 'Pago',
        tableName: 'Pago'
    }
);

module.exports = Pago;