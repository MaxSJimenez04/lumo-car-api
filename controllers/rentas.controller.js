const { Renta, Vehiculo, Usuario, Sucursal, Marca, sequelize } = require('../models');
const Sequelize = require('sequelize');
const bitacora = require('../middlewares/bitacora.middleware');
const { validationResult, body, param } = require('express-validator');
const servicioNotificacion = require('../services/notificacion.service');
const rentasServicio = require('../services/rentas.service');


let self = {}

const reglaIdVehiculo = (origen) => origen('idVehiculo')
    .notEmpty().withMessage('El id del vehículo no puede estar vacío')
    .bail()
    .isUUID().withMessage('Especificar id válida del vehículo');

const reglaIdUsuario = (origen) => origen('idUsuario')
    .notEmpty().withMessage('El id del usuario no puede estar vacío')
    .bail()
    .isUUID().withMessage('Especificar id válida del usuario');

self.validaciones = {
    crearRenta: [
        reglaIdVehiculo(body),
        reglaIdUsuario(body),
        body('fechaInicio')
            .notEmpty().withMessage('Especificar fecha de inicio')
            .bail()
            .isISO8601().withMessage('Especificar fecha de inicio válida'),
        body('fechaFin')
            .notEmpty().withMessage('Especificar fecha de finalización')
            .bail()
            .isISO8601().withMessage('Especificar fecha de finalización válida'),
        body('idTarjeta')
            .notEmpty().withMessage('El id de la tarjeta no puede estar vacío')
            .bail()
            .isUUID().withMessage('Especificar id válido de la tarjeta'),
        body('cvv')
            .notEmpty().withMessage('El CVV de la tarjeta no puede estar vacío')
            .bail()
            .isLength({ min: 3, max: 3 }).withMessage('El CVV debe ser de 3 dígitos')
    ],

    obtenerHistorial: [
        reglaIdUsuario(param)
    ],

    finalizarRenta: [
        param('idRenta')
            .notEmpty().withMessage('El id de la renta no puede estar vacío')
            .bail()
            .isInt().withMessage('Especificar id válido de la renta')
    ]
}

self.crearRenta = async function (req, res, next) {
    try {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        const { idVehiculo, idUsuario, fechaInicio, fechaFin, idTarjeta, cvv } = req.body;

        const fechaInicioParsed = new Date(fechaInicio);
        const fechaFinParsed = new Date(fechaFin);

        if (fechaFinParsed <= fechaInicioParsed) {
            return res.status(400).json({
                mensaje: "La fecha y hora de fin debe ser posterior a la de inicio."
            });
        }

        let renta, notificacion;
        try {
            ({ renta, notificacion } = await rentasServicio.ejecutarCreacionRenta({
                idVehiculo,
                idUsuario,
                fechaInicio: fechaInicioParsed,
                fechaFin: fechaFinParsed,
                idTarjeta,
                cvv
            }));
        } catch (err) {
            if (err.status) return res.status(err.status).json({ mensaje: err.message });
            throw err;
        }

        servicioNotificacion.enviarNotificacion(idUsuario, {
            tipo: 'NUEVA_NOTIFICACION',
            datos: notificacion
        });

        if (req.bitacora) {
            req.bitacora(`RENTA CREADA ${renta.id} - VEHICULO ${idVehiculo} - USUARIO ${idUsuario}`);
        }

        return res.status(201).json({
            mensaje: "Vehículo reservado con éxito. Recuerde llegar a tiempo.",
            renta
        });
    } catch (error) {
        next(error);
    }
}

self.obtenerHistorial = async function (req, res, next) {
    try {
        const errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() })
        }

        const { idUsuario } = req.params;

        const usuarioExiste = await Usuario.findByPk(idUsuario, { attributes: ['id'] });

        if (!usuarioExiste) {
            return res.status(404).json({
                mensaje: "No se encontró el usuario"
            });
        }

        const historial = await Renta.findAll({
            where: {
                idUsuario: idUsuario,
                estadoRenta: [2, 4]
            },
            attributes: ['id', 'fechaInicio', 'fechaFin', 'estadoRenta'],
            include: [
                {
                    model: Vehiculo,
                    attributes: ['id', 'modelo', 'placa'],
                    include: [
                        {
                            model: Sucursal,
                            attributes: ['nombre', 'direccion']
                        },
                        {
                            model: Marca,
                            attributes: ['nombreMarca']
                        }
                    ]
                }
            ],
            order: [['fechaInicio', 'DESC']]
        })

        if (!historial || historial.length === 0) {
            return res.status(200).json({
                mensaje: "Sin rentas",
                datos: []
            })
        }

        return res.status(200).json({
            mensaje: "Historial de rentas recuperado con éxito",
            datos: historial
        })
    } catch (error) {
        console.error()
    }
}

self.finalizarRenta = async function (req, res, next) {
    const t = await sequelize.transaction();

    try {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            await t.rollback();
            return res.status(400).json({ errores: errores.array() });
        }

        // TODO: implementar lógica de finalización
    } catch (error) {
        await t.rollback();
        next(error);
    }
}

module.exports = self