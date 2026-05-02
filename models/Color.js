const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');

class Color extends Model{
    static associate(models){
        Color.hasMany(models.Vehiculo, {foreignKey: 'idColor'})
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
            type: DataTypes.STRING(7)
        }
    },
    {
        sequelize,
        modelName: 'Color',
        tableName: 'Color'
    }
);

module.exports = Color;