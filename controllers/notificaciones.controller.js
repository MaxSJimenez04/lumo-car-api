const { Notificacion, Usuario } = require('../models');
const { ClaimTypes } = require('../config/claimtypes');
const { validationResult, param } = require('express-validator');

let self = {};

self.validaciones = {
    marcarUna: [
        param('id', 'ID de notificación inválido').isInt().notEmpty()
    ]
};

const obtenerIdUsuario = async (nombreUsuario) => {
    const usuario = await Usuario.findOne({ where: { usuario: nombreUsuario }, attributes: ['id'] });
    if (!usuario) throw new Error('Usuario no encontrado');
    return usuario.id;
};

self.obtenerNotificaciones = async (req, res, next) => {
    try {
        const idUsuario = await obtenerIdUsuario(req.decodedToken[ClaimTypes.Name]);

        const notificaciones = await Notificacion.findAll({
            where: { idUsuario },
            order: [['fecha_envio', 'DESC']]
        });

        return res.json({ ok: true, notificaciones });
    } catch (error) {
        next(error);
    }
};

self.marcarComoLeida = async (req, res, next) => {
    try {
        const errores = validationResult(req);
        if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

        const idUsuario = await obtenerIdUsuario(req.decodedToken[ClaimTypes.Name]);

        const notificacion = await Notificacion.findOne({
            where: { id: req.params.id, idUsuario }
        });

        if (!notificacion) return res.status(404).json({ ok: false, msg: 'Notificación no encontrada.' });

        notificacion.leida = true;
        await notificacion.save();

        return res.status(204).send();
    } catch (error) {
        next(error);
    }
};

self.marcarTodasComoLeidas = async (req, res, next) => {
    try {
        const idUsuario = await obtenerIdUsuario(req.decodedToken[ClaimTypes.Name]);

        await Notificacion.update(
            { leida: true },
            { where: { idUsuario, leida: false } }
        );

        return res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = self;
