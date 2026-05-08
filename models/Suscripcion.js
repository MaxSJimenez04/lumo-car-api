const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');

class Suscripcion extends Model{
    static associate(models){
        Suscripcion.belongsTo(models.SuscripcionUsuario,{foreignKey: 'idSuscripcion'})
    }
}

Suscripcion.init(
    {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        nombre:{
            type: DataTypes.STRING,
            allowNull: false
        },
        precio:{
            type: DataTypes.DECIMAL(9,2),
        },
        estado:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        descripcion:{
            type: DataTypes.STRING(1000)
        }
    },
    {
        sequelize,
        modelName:'Suscripcion',
        tableName:'Suscripcion'
    }
);

module.exports = Suscripcion;