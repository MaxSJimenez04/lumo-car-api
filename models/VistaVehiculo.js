const {DataTypes,  Model} = require('sequelize');
const sequelize = require('../config/db');

class VistaVehiculo extends Model{}

VistaVehiculo.init({
    id:{
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        modelo:{
            type: DataTypes.STRING,
            allowNull: false
        },
        pasajeros:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        transmision:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        tamano:{
            type: DataTypes.STRING(1),
            allowNull: false
        },
        tipo_combustible:{
            type: DataTypes.CHAR(1),
            allowNull: false
        },
        aire_acondicionado:{
        type: DataTypes.BOOLEAN 
        },
        estado:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idSucursal:{
            type: DataTypes.INTEGER,
            allowNull:false
        },
        nombreMarca:{
            type: DataTypes.STRING,
            allowNull: false
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
        modelName: 'VistaVehiculo',
        tableName:'vista_vehiculo',
        timestamps:false
    }
)

VistaVehiculo.sync = () => Promise.resolve();
module.exports = VistaVehiculo