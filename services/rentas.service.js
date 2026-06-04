const { Renta, Vehiculo, Pago, Notificacion, sequelize } = require('../models');
const catalogoTarifas = require('./tarifas.service');

let self = {};

self.verificarDisponibilidadVehiculo = async function (idVehiculo, t) {
    const vehiculo = await Vehiculo.findByPk(idVehiculo, {
        transaction: t,
        lock: t.LOCK.UPDATE
    });

    if (!vehiculo) {
        const err = new Error("El vehículo especificado no existe.");
        err.status = 404;
        throw err;
    }

    if (vehiculo.estado !== 1) {
        const err = new Error("Lo sentimos, este vehículo ya no se encuentra disponible. Por favor, seleccione otro.");
        err.status = 409;
        throw err;
    }

    return vehiculo;
};

self.calcularMontoRenta = function (tamano, fechaInicio, fechaFin) {
    const tarifaPorHora = catalogoTarifas.obtenerTarifasVehiculos(tamano);
    const horasTotales = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60));
    return horasTotales * tarifaPorHora;
};

self.ejecutarCreacionRenta = async function ({ idVehiculo, idUsuario, fechaInicio, fechaFin, idTarjeta, cvv }) {
    const t = await sequelize.transaction();

    try {
        const vehiculo = await self.verificarDisponibilidadVehiculo(idVehiculo, t);

        const montoTotal = self.calcularMontoRenta(vehiculo.tamano, fechaInicio, fechaFin);

        const renta = await Renta.create({
            fechaInicio,
            fechaFin,
            estadoRenta: 1,
            idUsuario,
            idVehiculo
        }, { transaction: t });

        await Pago.create({
            monto: montoTotal,
            fechaPago: new Date(),
            concepto: `Pago inicial por la renta del vehículo ${vehiculo.modelo} con placa ${vehiculo.placa}`,
            cvv,
            idTarjeta,
            idRenta: renta.id,
            idSuscripcion: null
        }, { transaction: t });

        vehiculo.estado = 2;
        await vehiculo.save({ transaction: t });

        const notificacion = await Notificacion.create({
            idUsuario,
            idRenta: renta.id,
            titulo: "Viaje confirmado",
            mensaje: `Tu pago de $${montoTotal} para el vehículo ${vehiculo.modelo} con placa ${vehiculo.placa} fue aprobada.`,
            tipo: 'RENTA_CREADA',
            leida: false,
            fecha_envio: new Date()
        }, { transaction: t });

        await t.commit();

        return { renta, notificacion };
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

module.exports = self;
