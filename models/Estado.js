const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');

class Estado extends Model{
    static associate(models){
        Estado.hasMany(models.Ciudad)
    }
}

Estado.init(
    {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        nombreEstado:{
            type: DataTypes.STRING
        }
    },
    {
        sequelize,
        modelName: 'Estado',
        tableName: 'Estado'
    }
);

module.exports = Estado;