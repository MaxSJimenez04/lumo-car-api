const { Renta, Vehiculo, Pago, Notificacion, sequelize } = require('../models');
const catalogoTarifas = require('./tarifas.service');
const pagosServicio = require('./pagos.service');

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
            estadoRenta: 0,
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

self.ejecutarCancelacionRenta = async function ({ idRenta }) {
    const t = await sequelize.transaction();

    try {
        const renta = await Renta.findByPk(idRenta, {
            include: [{ model: Vehiculo }],
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!renta) {
            const err = new Error('La renta especificada no existe.');
            err.status = 404;
            throw err;
        }

        if (renta.estadoRenta !== 0) {
            const err = new Error('Solo se pueden cancelar rentas que aún no han iniciado.');
            err.status = 409;
            throw err;
        }

        renta.estadoRenta = 3;
        await renta.save({ transaction: t });

        renta.Vehiculo.estado = 1;
        await renta.Vehiculo.save({ transaction: t });

        const notificacion = await Notificacion.create({
            idUsuario: renta.idUsuario,
            idRenta: renta.id,
            titulo: 'Renta cancelada',
            mensaje: `Tu reserva del vehículo ${renta.Vehiculo.modelo} con placa ${renta.Vehiculo.placa} ha sido cancelada.`,
            tipo: 'RENTA_CANCELADA',
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

self.ejecutarFinalizacionRenta = async function ({ idRenta }) {
    const t = await sequelize.transaction();

    try {
        const renta = await Renta.findByPk(idRenta, {
            include: [
                { model: Vehiculo },
                { model: Pago }
            ],
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!renta) {
            const err = new Error('La renta especificada no existe.');
            err.status = 404;
            throw err;
        }

        if (renta.estadoRenta !== 1) {
            const err = new Error('Esta renta ya fue finalizada.');
            err.status = 409;
            throw err;
        }

        const fechaEntrega = new Date();
        const tarifaPorHora = catalogoTarifas.obtenerTarifasVehiculos(renta.Vehiculo.tamano);
        const recargo = pagosServicio.calcularRecargoPorTiempo(renta.fechaFin, fechaEntrega, tarifaPorHora);

        if (recargo.aplicaRecargo) {
            await Pago.create({
                monto: recargo.montoRecargo,
                fechaPago: fechaEntrega,
                concepto: `Recargo por ${recargo.horasExtra} hora(s) extra del vehículo ${renta.Vehiculo.modelo} con placa ${renta.Vehiculo.placa}`,
                idTarjeta: renta.Pago.idTarjeta,
                idRenta: renta.id,
                idSuscripcion: null
            }, { transaction: t });
        }

        renta.estadoRenta = 2;
        await renta.save({ transaction: t });

        renta.Vehiculo.estado = 1;
        await renta.Vehiculo.save({ transaction: t });

        const notificacion = await Notificacion.create({
            idUsuario: renta.idUsuario,
            idRenta: renta.id,
            titulo: 'Renta finalizada',
            mensaje: recargo.aplicaRecargo
                ? `Tu renta ha finalizado. Se aplicó un recargo de $${recargo.montoRecargo} por ${recargo.horasExtra} hora(s) extra.`
                : 'Tu renta ha finalizado sin cargos adicionales.',
            tipo: 'RENTA_FINALIZADA',
            leida: false,
            fecha_envio: fechaEntrega
        }, { transaction: t });

        await t.commit();

        return { renta, notificacion, recargo };
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

module.exports = self;
