jest.mock('../services/suscripciones.service', () => ({
    obtenerPlanesActivos: jest.fn(),
    obtenerSuscripcionActivaUsuario: jest.fn(),
    suscribirUsuario: jest.fn(),
    cancelarSuscripcion: jest.fn(),
    cambiarPlan: jest.fn()
}));

jest.mock('../services/notificacion.service', () => ({
    enviarNotificacion: jest.fn()
}));

const suscripcionesController = require('../controllers/suscripciones.controller');
const suscripcionesService = require('../services/suscripciones.service');
const servicioNotificacion = require('../services/notificacion.service');
const { ClaimTypes } = require('../config/claimtypes');

const MOCK_ID_USUARIO = 'a1b2c3d4-e5f6-7890-abcd-1234567890ab';
const MOCK_NOTIFICACION = { id: 99, tipo: 'SUSCRIPCION_CREADA' };

describe('Pruebas del Módulo de Suscripciones', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            decodedToken: {
                [ClaimTypes.Name]: 'id-usuario-12345'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks(); 
    });

    test('Obtener planes activos exitosamente (Status 200)', async () => {
        const planesSimulados = [{ id: 1, nombre: 'Básico' }, { id: 2, nombre: 'Premium' }];
        suscripcionesService.obtenerPlanesActivos.mockResolvedValue(planesSimulados);

        await suscripcionesController.getPlanes(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, planes: planesSimulados });
        expect(suscripcionesService.obtenerPlanesActivos).toHaveBeenCalledTimes(1);
    });

    test('Devolver error 404 si el usuario no tiene suscripción activa', async () => {
        suscripcionesService.obtenerSuscripcionActivaUsuario.mockResolvedValue(null);

        await suscripcionesController.getMiSuscripcion(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            ok: false,
            msg: 'No cuentas con una suscripción activa.'
        }));
    });

    test('Suscribir a un usuario exitosamente, enviar notificación SSE y responder 201', async () => {
        req.body = {
            idSuscripcion: 1,
            numeroTarjeta: '1234567890123456',
            cvv: '123',
            titular: 'Prueba Jest',
            fechaVencimiento: '12/28'
        };

        const suscripcionSimulada = { id: 1, idUsuario: MOCK_ID_USUARIO, estado: 0 };
        suscripcionesService.suscribirUsuario.mockResolvedValue({
            suscripcion: suscripcionSimulada,
            notificacion: MOCK_NOTIFICACION
        });

        await suscripcionesController.postSuscribirse(req, res);

        expect(servicioNotificacion.enviarNotificacion).toHaveBeenCalledWith(
            MOCK_ID_USUARIO,
            expect.objectContaining({ tipo: 'NUEVA_NOTIFICACION', datos: MOCK_NOTIFICACION })
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            ok: true,
            msg: 'Suscripción exitosa y pago procesado.',
            suscripcion: suscripcionSimulada
        }));
    });

    test('Fallo al suscribirse si el plan no existe (Status 400)', async () => {
        req.body = { idSuscripcion: 999 };

        suscripcionesService.suscribirUsuario.mockRejectedValue(new Error('El plan seleccionado no existe'));

        await suscripcionesController.postSuscribirse(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            ok: false,
            msg: 'El plan seleccionado no existe'
        }));
    });
});

describe('Pruebas de Cancelar Suscripción', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, decodedToken: { [ClaimTypes.Name]: 'usuarioPrueba' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });

    test('Cancelar suscripción, enviar notificación SSE y responder 200', async () => {
        const mockSuscripcion = { id: 5, idUsuario: MOCK_ID_USUARIO, estado: 1 };
        suscripcionesService.cancelarSuscripcion.mockResolvedValue({
            suscripcion: mockSuscripcion,
            notificacion: { id: 100, tipo: 'SUSCRIPCION_CANCEL' }
        });

        await suscripcionesController.putCancelarSuscripcion(req, res);

        expect(servicioNotificacion.enviarNotificacion).toHaveBeenCalledWith(
            MOCK_ID_USUARIO,
            expect.objectContaining({ tipo: 'NUEVA_NOTIFICACION' })
        );
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            ok: true,
            msg: 'Suscripción cancelada correctamente.'
        }));
    });

    test('Devolver 400 si el usuario no tiene suscripción activa para cancelar', async () => {
        suscripcionesService.cancelarSuscripcion.mockRejectedValue(new Error('No tienes una suscripción activa para cancelar'));

        await suscripcionesController.putCancelarSuscripcion(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            ok: false,
            msg: 'No tienes una suscripción activa para cancelar'
        }));
    });
});

describe('Pruebas de Cambiar Plan', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, decodedToken: { [ClaimTypes.Name]: 'usuarioPrueba' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });

    test('Cambiar plan, enviar notificación SSE y responder 200', async () => {
        const mockSuscripcion = { id: 20, idUsuario: MOCK_ID_USUARIO, estado: 0 };
        suscripcionesService.cambiarPlan.mockResolvedValue({
            suscripcion: mockSuscripcion,
            notificacion: { id: 101, tipo: 'SUSCRIPCION_CAMBIO' }
        });

        req.body = { nuevoIdSuscripcion: 2, idTarjetaExistente: 'uuid-t', cvv: '123' };
        await suscripcionesController.postCambiarPlan(req, res);

        expect(servicioNotificacion.enviarNotificacion).toHaveBeenCalledWith(
            MOCK_ID_USUARIO,
            expect.objectContaining({ tipo: 'NUEVA_NOTIFICACION' })
        );
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            ok: true,
            msg: 'Cambio de plan exitoso y pago procesado.'
        }));
    });

    test('Devolver 400 si el nuevo plan no existe', async () => {
        suscripcionesService.cambiarPlan.mockRejectedValue(new Error('El nuevo plan no existe'));

        req.body = { nuevoIdSuscripcion: 999 };
        await suscripcionesController.postCambiarPlan(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            ok: false,
            msg: 'El nuevo plan no existe'
        }));
    });
});