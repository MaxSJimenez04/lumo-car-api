const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');
class Pago extends Model{
    static associate(models){
        Pago.belongsTo(models.Tarjeta,{foreignKey: 'idTarjeta'});
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
        },
        concepto:{
            type: DataTypes.STRING
        },
         cvv:{
            type: DataTypes.CHAR(3),
            allowNull: false
        },
        idTarjeta:{
            type: DataTypes.UUID,
            allowNull: false,
        }
    },
    {
        sequelize,
        modelName: 'Pago',
        tableName: 'Pago'
    }
);

module.exports = Pago;