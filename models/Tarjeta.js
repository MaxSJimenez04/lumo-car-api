const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');

class Tarjeta extends Model{
    static associate(models){
        Tarjeta.belongsTo(models.Usuario, {foreignKey: 'idCliente'})
    }
}

Tarjeta.init(
    {
        id:{
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true
        },
        numeroTarjeta:{
            type: DataTypes.STRING(21),
            allowNull: false
        },
        cvv:{
            type: DataTypes.CHAR(3),
            allowNull: false
        },
        titular:{
            type:DataTypes.STRING,
            allowNull: false
        },
        fechaVencimiento:{
            type: DataTypes.CHAR(5),
            allowNull: false
        },
        idCliente:{
            type: DataTypes.UUID,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'Tarjeta',
        tableName:'Tarjeta'
    }
);

module.exports = Tarjeta;