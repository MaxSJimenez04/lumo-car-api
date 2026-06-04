const { Notificacion } = require('../models');
const { validationResult, param } = require('express-validator');
const { Op } = require('sequelize');

let self = {};

self.validaciones = {
    consultarNotificaciones: [
        param('idUsuario')
            .notEmpty().withMessage('El id del usuario es obligatorio')
            .bail()
            .isUUID.withMessage('Especificar un id de usuario válido')
    ]
};

self.consultarNotificaciones = async function (req, res, next) {
    try {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        const { idUsuario } = req.params;

        const notificaciones = await Notificacion.findAll({
            where: { idUsuario: idUsuario },
            order: [['fecha_envio', 'DESC']]
        });

        if (!notificaciones || notificaciones.length === 0) {
            return res.status(200).json({
                mensaje: "No tienes notificaiones por el momento",
                datos: []
            });
        }

        const notificacionesNoLeidas = notificaciones.filter(notif => notif.leida === false);

        if (notificacionesNoLeidas.length > 0) {
            const idsNoLeidas = notificacionesNoLeidas.map(notif => notif.id);

            await Notificacion.update(
                { leida: true },
                {
                    where: {
                        id: { [Op.in]: idsNoLeidas }
                    }
                }
            );
        }

        return res.status(200).json({
            mensaje: "Notificaciones recuperadas con éxito",
            datos: notificaciones
        });
    } catch (error) {
        return res.status(500).json({
            mensaje: "Ocurrió un error al procesar las notificaciones."
        });
    }
}

module.exports = self;