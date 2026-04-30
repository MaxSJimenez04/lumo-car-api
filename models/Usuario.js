const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');

class Usuario extends Model{
    static associate(models){
        Usuario.belongsTo(models.Rol, {foreignKey: 'idRol'})
        Usuario.belongsToMany(models.Sucursal, {through: models.AdminSucursal})
        Usuario.belongsToMany(models.Vehiculo, {through: models.Renta})
        Usuario.hasMany(models.Tarjeta)
        Usuario.hasOne(models.Archivo)
    }
}

Usuario.init(
    {
        id:{
            type: DataTypes.UUID, //Tipo de ID 
            allowNull: false,
            primaryKey: true
        },
        usuario:{
            type: DataTypes.STRING(100), //Permite un varchar(100) y no 255
            allowNull: false
        },
        nombre:{
            type: DataTypes.STRING,
            allowNull: false
        },
        apellidos:{
            type: DataTypes.STRING,
            allowNull: false
        },
        correo:{
            type: DataTypes.STRING,
            allowNull: false
        },
        telefono:{
            type: DataTypes.STRING(15),
            allowNull: false
        },
        fecha_nacimiento: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },

        idRol: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        rutaImagen:{
            type: DataTypes.STRING
        }
    },
    {
        sequelize,
        modelName: 'Usuario',
        tableName:'Usuario'
    }
);

module.exports = Usuario;