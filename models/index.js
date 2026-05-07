const sequelize = require('../config/db');
const AdminSucursal = require('./AdminSucursal');
const Archivo = require('./Archivo');
const Ciudad = require('./Ciudad');
const Color = require('./Color');
const Estado = require('./Estado');
const Marca = require('./Marca');
const Pago = require('./Pago');
const Renta = require('./Renta');
const Rol = require('./Rol');
const Sucursal = require('./Sucursal');
const Suscripcion = require('./Suscripcion');
const SuscripcionUsuario = require('./SuscripcionUsuario');
const Tarjeta = require('./Tarjeta');
const Usuario = require('./Usuario');
const Vehiculo = require('./Vehiculo');
const Notificacion = require('./Notificacion');

const models = { AdminSucursal, Archivo, Ciudad, Color, Estado,
    Marca, Pago, Renta, Rol, Sucursal, Suscripcion, SuscripcionUsuario, Tarjeta, Usuario, Vehiculo, Notificacion
}

Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = {
    sequelize, AdminSucursal, Archivo, Ciudad, Color, Estado,
    Marca, Pago, Renta, Rol, Sucursal, Suscripcion, SuscripcionUsuario, Tarjeta, Usuario, Vehiculo, Notificacion
}