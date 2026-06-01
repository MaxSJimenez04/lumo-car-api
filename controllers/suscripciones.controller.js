const suscripcionesService = require('../services/suscripciones.service');
const { ClaimTypes } = require('../config/claimtypes');

const getPlanes = async (req, res) => {
    try {
        const planes = await suscripcionesService.obtenerPlanesActivos();
        res.json({ ok: true, planes });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al obtener los planes', error: error.message });
    }
};

const getMiSuscripcion = async (req, res) => {
    try {
        const idUsuario = req.decodedToken[ClaimTypes.Name]; 
        
        const suscripcion = await suscripcionesService.obtenerSuscripcionActivaUsuario(idUsuario);
        
        if (!suscripcion) {
            return res.status(404).json({ ok: false, msg: 'No cuentas con una suscripción activa.' });
        }
        res.json({ ok: true, suscripcion });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al consultar suscripción', error: error.message });
    }
};

const postSuscribirse = async (req, res) => {
    try {
        const idUsuario = req.decodedToken[ClaimTypes.Name];
        const datosSuscripcion = req.body; 

        const resultado = await suscripcionesService.suscribirUsuario(idUsuario, datosSuscripcion);
        
        res.status(201).json({ 
            ok: true,
            msg: 'Suscripción exitosa y pago procesado.', 
            suscripcion: resultado 
        });
    } catch (error) {
        res.status(400).json({ ok: false, msg: error.message });
    }
};

const putCambiarMetodoPago = async (req, res) => {
    try {
        const idUsuario = req.decodedToken[ClaimTypes.Name];
        const datosTarjeta = req.body;

        const nuevaTarjeta = await suscripcionesService.cambiarMetodoPago(idUsuario, datosTarjeta);
        res.status(201).json({ ok: true, msg: 'Método de pago agregado correctamente', nuevaTarjeta });
    } catch (error) {
        res.status(400).json({ ok: false, msg: 'Error al registrar método de pago', error: error.message });
    }
};

const putCancelarSuscripcion = async (req, res) => {
    try {
        const idUsuario = req.decodedToken[ClaimTypes.Name];
        await suscripcionesService.cancelarSuscripcion(idUsuario);
        res.json({ ok: true, msg: 'Suscripción cancelada correctamente.' });
    } catch (error) {
        res.status(400).json({ ok: false, msg: error.message });
    }
};

const postCambiarPlan = async (req, res) => {
    try {
        const idUsuario = req.decodedToken[ClaimTypes.Name];
        const datosCambio = req.body; 

        await suscripcionesService.cambiarPlan(idUsuario, datosCambio);
        res.json({ ok: true, msg: 'Cambio de plan exitoso y pago procesado.' });
    } catch (error) {
        res.status(400).json({ ok: false, msg: error.message });
    }
};

module.exports = {
    getPlanes,
    getMiSuscripcion,
    postSuscribirse,
    putCambiarMetodoPago,
    putCancelarSuscripcion,
    postCambiarPlan
};