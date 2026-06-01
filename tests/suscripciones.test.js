jest.mock('../services/suscripciones.service', () => ({
    obtenerPlanesActivos: jest.fn(),
    obtenerSuscripcionActivaUsuario: jest.fn(),
    suscribirUsuario: jest.fn()
}));

const suscripcionesController = require('../controllers/suscripciones.controller');
const suscripcionesService = require('../services/suscripciones.service');
const { ClaimTypes } = require('../config/claimtypes');

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

    test('Suscribir a un usuario exitosamente (Status 201)', async () => {
        req.body = {
            idSuscripcion: 1,
            numeroTarjeta: '1234567890123456',
            cvv: '123',
            titular: 'Prueba Jest',
            fechaVencimiento: '12/28'
        };

        const suscripcionSimulada = { id: 1, estado: 0, idSuscripcion: 1 };
        suscripcionesService.suscribirUsuario.mockResolvedValue(suscripcionSimulada);

        await suscripcionesController.postSuscribirse(req, res);

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