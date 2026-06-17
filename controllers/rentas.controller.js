const { Renta, Vehiculo, Pago, Usuario, Sucursal, Marca } = require('../models');
const Sequelize = require('sequelize');
const bitacora = require('../middlewares/bitacora.middleware');
const { validationResult, body, param } = require('express-validator');
const servicioNotificacion = require('../services/notificacion.service');
const rentasServicio = require('../services/rentas.service');
const { ClaimTypes } = require('../config/claimtypes');


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
    calcularRenta: [
        reglaIdVehiculo(body),
        body('fechaInicio')
            .notEmpty().withMessage('Especificar fecha de inicio')
            .bail()
            .isISO8601().withMessage('Especificar fecha de inicio válida'),
        body('fechaFin')
            .notEmpty().withMessage('Especificar fecha de finalización')
            .bail()
            .isISO8601().withMessage('Especificar fecha de finalización válida')
    ],

    crearRenta: [
        reglaIdVehiculo(body),
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
            .isNumeric({ no_symbols: true }).withMessage('El CVV debe contener únicamente números')
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
    ],

    cancelarRenta: [
        param('idRenta')
            .notEmpty().withMessage('El id de la renta no puede estar vacío')
            .bail()
            .isInt().withMessage('Especificar id válido de la renta')
    ]
}

self.calcularRenta = async function (req, res, next) {
    try {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        const { idVehiculo, fechaInicio, fechaFin } = req.body;
        const fechaInicioParsed = new Date(fechaInicio);
        const fechaFinParsed = new Date(fechaFin);

        if (fechaFinParsed <= fechaInicioParsed) {
            return res.status(400).json({ mensaje: 'La fecha y hora de fin debe ser posterior a la de inicio.' });
        }

        const vehiculo = await Vehiculo.findByPk(idVehiculo, {
            attributes: ['id', 'modelo', 'placa', 'tamano', 'pasajeros', 'transmision', 'tipo_combustible', 'aire_acondicionado', 'estado'],
            include: [
                { model: Sucursal, attributes: ['id', 'nombre', 'direccion'] },
                { model: Marca, attributes: ['nombreMarca'] }
            ]
        });

        if (!vehiculo) return res.status(404).json({ mensaje: 'El vehículo especificado no existe.' });
        if (vehiculo.estado !== 1) return res.status(409).json({ mensaje: 'Lo sentimos, este vehículo ya no se encuentra disponible.' });

        const montoTotal = rentasServicio.calcularMontoRenta(vehiculo.tamano, fechaInicioParsed, fechaFinParsed);

        return res.json({ vehiculo, fechaInicio: fechaInicioParsed, fechaFin: fechaFinParsed, montoTotal });
    } catch (error) {
        next(error);
    }
}

self.crearRenta = async function (req, res, next) {
    try {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        const nombreUsuario = req.decodedToken[ClaimTypes.Name];
        const usuarioBD = await Usuario.findOne({ where: { usuario: nombreUsuario }, attributes: ['id'] });
        if (!usuarioBD) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        const idUsuario = usuarioBD.id;

        const { idVehiculo, fechaInicio, fechaFin, idTarjeta, cvv } = req.body;

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
                estadoRenta: [0, 2, 3, 4]
            },
            attributes: ['id', 'fechaInicio', 'fechaFin', 'estadoRenta', 'createdAt'],
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
                },
                {
                    model: Pago,
                    attributes: ['monto', 'concepto', 'fechaPago']
                }
            ],
            order: [['createdAt', 'DESC']]
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
    try {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        const { idRenta } = req.params;

        let renta, notificacion, recargo;
        try {
            ({ renta, notificacion, recargo } = await rentasServicio.ejecutarFinalizacionRenta({ idRenta }));
        } catch (err) {
            if (err.status) return res.status(err.status).json({ mensaje: err.message });
            throw err;
        }

        servicioNotificacion.enviarNotificacion(renta.idUsuario, {
            tipo: 'NUEVA_NOTIFICACION',
            datos: notificacion
        });

        if (req.bitacora) {
            req.bitacora(`RENTA FINALIZADA ${renta.id} - USUARIO ${renta.idUsuario}`);
        }

        return res.status(200).json({
            mensaje: 'Renta finalizada con éxito.',
            recargo: recargo.aplicaRecargo ? recargo.montoRecargo : 0,
            renta
        });
    } catch (error) {
        next(error);
    }
}

self.cancelarRenta = async function (req, res, next) {
    try {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        const { idRenta } = req.params;

        let renta, notificacion, montoReembolso;
        try {
            ({ renta, notificacion, montoReembolso } = await rentasServicio.ejecutarCancelacionRenta({ idRenta }));
        } catch (err) {
            if (err.status) return res.status(err.status).json({ mensaje: err.message });
            throw err;
        }

        servicioNotificacion.enviarNotificacion(renta.idUsuario, {
            tipo: 'NUEVA_NOTIFICACION',
            datos: notificacion
        });

        if (req.bitacora) {
            req.bitacora(`RENTA CANCELADA ${renta.id} - USUARIO ${renta.idUsuario}`);
        }

        return res.status(200).json({
            mensaje: 'Renta cancelada con éxito.',
            montoReembolso,
            renta
        });
    } catch (error) {
        next(error);
    }
}

module.exports = self