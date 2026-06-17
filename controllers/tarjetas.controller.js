const { Tarjeta, Usuario } = require('../models');
const { ClaimTypes } = require('../config/claimtypes');
const { validationResult, body, param } = require('express-validator');
const crypto = require('crypto');

const self = {};

self.validaciones = {
    guardar: [
        body('numeroTarjeta')
            .notEmpty().withMessage('Especificar número de tarjeta')
            .bail()
            .isString().withMessage('Debe ser una cadena')
            .isLength({ min: 16, max: 16 }).withMessage('Formato inválido'),
        body('cvv')
            .notEmpty().withMessage('El CVV de la tarjeta no puede estar vacío')
            .bail()
            .isNumeric({ no_symbols: true }).withMessage('El CVV debe contener únicamente números')
            .bail()
            .isLength({ min: 3, max: 3 }).withMessage('El CVV debe ser de 3 dígitos'),
        body('titular')
            .notEmpty().withMessage('Especificar titular')
            .bail()
            .isString().withMessage('Debe ser una cadena'),
        body('fechaVencimiento')
            .notEmpty().withMessage('Especificar fecha de vencimiento')
            .bail()
            .matches(/^\d{2}\/\d{2}$/).withMessage('Fecha de vencimiento con formato inválido')
    ],
    eliminar: [
        param('id', 'ID de tarjeta inválido').isUUID().notEmpty()
    ]
};

const obtenerIdUsuario = async (nombreUsuario) => {
    const usuario = await Usuario.findOne({ where: { usuario: nombreUsuario }, attributes: ['id'] });
    if (!usuario) throw new Error('Usuario no encontrado');
    return usuario.id;
};

self.obtenerTarjetas = async (req, res, next) => {
    try {
        const idUsuario = await obtenerIdUsuario(req.decodedToken[ClaimTypes.Name]);

        const tarjetas = await Tarjeta.findAll({
            where: { idCliente: idUsuario },
            attributes: ['id', 'numeroTarjeta', 'titular', 'fechaVencimiento']
        });

        return res.json({ ok: true, tarjetas });
    } catch (error) {
        next(error);
    }
};

self.guardarTarjeta = async (req, res, next) => {
    try {
        const errores = validationResult(req);
        if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

        const idUsuario = await obtenerIdUsuario(req.decodedToken[ClaimTypes.Name]);
        const { numeroTarjeta, cvv, titular, fechaVencimiento } = req.body;

        const tarjeta = await Tarjeta.create({
            id: crypto.randomUUID(),
            numeroTarjeta,
            cvv,
            titular,
            fechaVencimiento,
            idCliente: idUsuario
        });

        if (req.bitacora) req.bitacora(`TARJETA REGISTRADA ${tarjeta.id}`);

        return res.status(201).json({
            ok: true,
            msg: 'Tarjeta guardada correctamente.',
            tarjeta: {
                id: tarjeta.id,
                numeroTarjeta: tarjeta.numeroTarjeta,
                titular: tarjeta.titular,
                fechaVencimiento: tarjeta.fechaVencimiento
            }
        });
    } catch (error) {
        next(error);
    }
};

self.eliminarTarjeta = async (req, res, next) => {
    try {
        const errores = validationResult(req);
        if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

        const idUsuario = await obtenerIdUsuario(req.decodedToken[ClaimTypes.Name]);

        const tarjeta = await Tarjeta.findOne({
            where: { id: req.params.id, idCliente: idUsuario }
        });

        if (!tarjeta) return res.status(404).json({ ok: false, msg: 'Tarjeta no encontrada.' });

        await tarjeta.destroy();

        if (req.bitacora) req.bitacora(`TARJETA ELIMINADA ${req.params.id}`);

        return res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = self;
