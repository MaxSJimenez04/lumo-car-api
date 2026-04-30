const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');

class Color extends Model{
    static associate(models){
        Color.hasMany(models.Vehiculo)
    }
}

Color.init(
    {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        color:{
            type: DataTypes.STRING
        },
        codigoHex:{
            type: DataTypes.STRING(6)
        }
    },
    {
        sequelize,
        modelName: 'Color',
        tableName: 'Color'
    }
);

module.exports = Color;