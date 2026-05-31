const { Renta, Vehiculo, Usuario, Sucursal, sequelize } = require('../models');
const Sequelize = require('sequelize');
const bitacora = require('../middlewares/bitacora.middleware');
const { validationResult, body, param } = require('express-validator');
const path = require('path');
const fs = require('fs');

let self = {}

self.rentaValidator = [
    body('idVehiculo')
        .notEmpty().withMessage('El id del vehículo no puede estar vacío')
        .bail()
        .isUUID().withMessage('Especificar id válida del vehículo'),
    body('idUsuario')
        .notEmpty().withMessage('El id del usuario no puede estar vacío')
        .bail()
        .isUUID().withMessage('Especificar id válida del usuario')
]

self.validaciones = {
    crearRenta: [
        body('idVehiculo')
            .notEmpty().withMessage('El id del vehículo no puede estar vacío')
            .bail()
            .isUUID().withMessage('Especificar id válida del vehículo'),
        body('idUsuario')
            .notEmpty().withMessage('El id del usuario no puede estar vacío')
            .bail()
            .isUUID().withMessage('Especificar id válida del usuario'),
        body('fechaInicio')
            .notEmpty().withMessage('Especificar fecha de inicio')
            .bail()
            .isISO8601().withMessage('Especificar fecha de inicio válida'),
        body('fechaFin')
            .notEmpty().withMessage('Especificar fecha de finalización')
            .bail()
            .isISO8601().withMessage('Especificar fecha de finalización válida')
    ]
}
self.crearRenta = async function (req, res, next) {
    try {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        let { idVehiculo, idUsuario, fechaInicio, fechaFin } = req.body;

        let fechaInicioParsed = new Date(fechaInicio);
        let fechaFinParsed = new Date(fechaFin);

        if (fechaFinParsed <= fechaInicioParsed) {
            return res.status(400).json({
                mensaje: "La fecha y hora de fin debe ser posterior a la de inicio."
            })
        }

        const t = await sequelize.transaction();

        try {
            const vehiculo = await Vehiculo.findByPk(idVehiculo, {
                transaction: t,
                lock: t.LOCK.UPDATE
            })

            if (!vehiculo) {
                await t.rollback()
                return res.status(404).json({
                    mensaje: "El vehículo especificado no existe."
                })
            }

            if (vehiculo.estado !== 1) {
                await t.rollback()
                return res.status(409).json({
                    mensaje: "Lo sentimos, este vehículo ya no se encuentra disponible." +
                        "Por favor, seleccione otro."
                })
            }

            vehiculo.estado = 2
            await vehiculo.save({ transaction: t })

            let rentaGenerada = await Renta.create({
                fechaInicio: fechaInicioParsed,
                fechaFin: fechaFinParsed,
                estadoRenta: 1,
                idUsuario: idUsuario,
                idVehiculo: idVehiculo
            }, { transaction: t })

            await t.commit();

            if (req.bitacora) {
                req.bitacora(`RENTA CREADA ${rentaGenerada.id} - VEHICULO ${idVehiculo} - USUARIO ${idUsuario}`);
            }

            return res.status(201).json({
                mensaje: "Vehículo reservado con éxito. Recuerde llegar a tiempo.",
                renta: rentaGenerada
            })
        } catch (innerError) {
            t.rollback();
            throw innerError;
        }

    } catch (error) {
        next(error);
    }
}

module.exports = self