jest.mock('../models', () => ({
    Notificacion: {
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn()
    },
    Usuario: {
        findOne: jest.fn()
    }
}));

jest.mock('express-validator', () => ({
    validationResult: jest.fn(),
    param: jest.fn(() => ({ isInt: jest.fn().mockReturnThis(), notEmpty: jest.fn().mockReturnThis(), withMessage: jest.fn().mockReturnThis() }))
}));

const notificacionesController = require('../controllers/notificaciones.controller');
const { Notificacion, Usuario } = require('../models');
const { validationResult } = require('express-validator');
const { ClaimTypes } = require('../config/claimtypes');

const MOCK_ID_USUARIO = 'a1b2c3d4-e5f6-7890-abcd-111111111111';

const sinErrores = { isEmpty: () => true, array: () => [] };
const conErrores = { isEmpty: () => false, array: () => [{ msg: 'ID de notificación inválido' }] };

describe('Pruebas de Obtener Notificaciones', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { decodedToken: { [ClaimTypes.Name]: 'usuarioPrueba' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        Usuario.findOne.mockResolvedValue({ id: MOCK_ID_USUARIO });
    });

    test('Devolver lista de notificaciones del usuario (Status 200)', async () => {
        const notificacionesSimuladas = [
            { id: 1, titulo: 'Viaje confirmado', leida: false },
            { id: 2, titulo: 'Renta cancelada', leida: true }
        ];
        Notificacion.findAll.mockResolvedValue(notificacionesSimuladas);

        await notificacionesController.obtenerNotificaciones(req, res, next);

        expect(Notificacion.findAll).toHaveBeenCalledWith(expect.objectContaining({
            where: { idUsuario: MOCK_ID_USUARIO }
        }));
        expect(res.json).toHaveBeenCalledWith({ ok: true, notificaciones: notificacionesSimuladas });
    });

    test('Devolver lista vacía si el usuario no tiene notificaciones', async () => {
        Notificacion.findAll.mockResolvedValue([]);

        await notificacionesController.obtenerNotificaciones(req, res, next);

        expect(res.json).toHaveBeenCalledWith({ ok: true, notificaciones: [] });
    });

    test('Llamar next con error si el usuario no existe', async () => {
        Usuario.findOne.mockResolvedValue(null);

        await notificacionesController.obtenerNotificaciones(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(Notificacion.findAll).not.toHaveBeenCalled();
    });
});

describe('Pruebas de Marcar Una Notificación Como Leída', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            decodedToken: { [ClaimTypes.Name]: 'usuarioPrueba' },
            params: { id: '1' }
        };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
        next = jest.fn();
        Usuario.findOne.mockResolvedValue({ id: MOCK_ID_USUARIO });
    });

    test('Marcar notificación como leída y responder 204', async () => {
        validationResult.mockReturnValue(sinErrores);
        const mockNotificacion = { id: 1, leida: false, save: jest.fn().mockResolvedValue() };
        Notificacion.findOne.mockResolvedValue(mockNotificacion);

        await notificacionesController.marcarComoLeida(req, res, next);

        expect(Notificacion.findOne).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: '1', idUsuario: MOCK_ID_USUARIO }
        }));
        expect(mockNotificacion.leida).toBe(true);
        expect(mockNotificacion.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    test('Devolver 404 si la notificación no existe o no pertenece al usuario', async () => {
        validationResult.mockReturnValue(sinErrores);
        Notificacion.findOne.mockResolvedValue(null);

        await notificacionesController.marcarComoLeida(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
    });

    test('Devolver 400 si el id de notificación es inválido', async () => {
        validationResult.mockReturnValue(conErrores);

        await notificacionesController.marcarComoLeida(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(Notificacion.findOne).not.toHaveBeenCalled();
    });
});

describe('Pruebas de Marcar Todas las Notificaciones Como Leídas', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { decodedToken: { [ClaimTypes.Name]: 'usuarioPrueba' } };
        res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        next = jest.fn();
        Usuario.findOne.mockResolvedValue({ id: MOCK_ID_USUARIO });
    });

    test('Marcar todas las notificaciones como leídas y responder 204', async () => {
        Notificacion.update.mockResolvedValue([2]);

        await notificacionesController.marcarTodasComoLeidas(req, res, next);

        expect(Notificacion.update).toHaveBeenCalledWith(
            { leida: true },
            { where: { idUsuario: MOCK_ID_USUARIO, leida: false } }
        );
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    test('Llamar next con error si el usuario no existe', async () => {
        Usuario.findOne.mockResolvedValue(null);

        await notificacionesController.marcarTodasComoLeidas(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(Notificacion.update).not.toHaveBeenCalled();
    });
});
