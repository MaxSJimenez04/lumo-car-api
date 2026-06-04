const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
    LOCK: { UPDATE: 'UPDATE' }
};

jest.mock('../models', () => ({
    sequelize: {
        transaction: jest.fn(() => Promise.resolve(mockTransaction)),
        queryInterface: { describeTable: jest.fn().mockResolvedValue({}) },
        models: {}
    },
    Sequelize: { Op: {} },
    Vehiculo: { findByPk: jest.fn() },
    Renta: { create: jest.fn(), findAll: jest.fn() },
    Usuario: { findByPk: jest.fn() },
    Sucursal: { nombre: 'Sucursal' },
    Marca: { nombreMarca: 'Marca' }
}));

jest.mock('../middlewares/bitacora.middleware', () => jest.fn((req, res, next) => next()));

jest.mock('../services/rentas.service', () => ({
    ejecutarCreacionRenta: jest.fn(),
    ejecutarCancelacionRenta: jest.fn(),
    ejecutarFinalizacionRenta: jest.fn()
}));

jest.mock('../services/notificacion.service', () => ({
    enviarNotificacion: jest.fn()
}));

const rentaController = require('../controllers/rentas.controller');
const { validaciones } = require('../controllers/rentas.controller');
const { Renta, Usuario } = require('../models');
const rentasServicio = require('../services/rentas.service');
const servicioNotificacion = require('../services/notificacion.service');

describe('Pruebas de Reservar Vehículo', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            body: {},
            header: jest.fn(),
            bitacora: jest.fn()
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    test('Devolver código 400 si faltan datos obligatorios o son inválidos', async () => {
        req.body = {
            idVehiculo: '',
            idUsuario: 'uno',
            fechaInicio: '19/05/2026',
            fechaFin: '20/05/2026',
            idTarjeta: '',
            cvv: 'abc'
        };

        await Promise.all(validaciones.crearRenta.map(v => v(req, res, () => { })));
        await rentaController.crearRenta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        const errores = res.json.mock.calls[0][0].errores;
        expect(errores).toHaveLength(6);
    });

    test('Devolver código 400 si la fechaFin es anterior a la fechaInicio', async () => {
        req.body = {
            idVehiculo: 'e4d909c2-901a-4d2b-b6d5-123456789abc',
            idUsuario: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
            fechaInicio: '2026-05-31T12:00:00.000Z',
            fechaFin: '2020-01-01T15:00:00.000Z',
            idTarjeta: 'f1e2d3c4-b5a6-7890-abcd-1234567890ab',
            cvv: '123'
        };

        await Promise.all(validaciones.crearRenta.map(v => v(req, res, () => { })));
        await rentaController.crearRenta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            mensaje: expect.stringContaining('debe ser posterior')
        }));
    });

    test('Devolver código 404 si el vehículo no existe', async () => {
        req.body = {
            idVehiculo: 'e4d909c2-901a-4d2b-b6d5-123456789abc',
            idUsuario: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
            fechaInicio: '2026-05-31T12:00:00.000Z',
            fechaFin: '2026-06-01T15:00:00.000Z',
            idTarjeta: 'f1e2d3c4-b5a6-7890-abcd-1234567890ab',
            cvv: '123'
        };

        const err = Object.assign(new Error('El vehículo especificado no existe.'), { status: 404 });
        rentasServicio.ejecutarCreacionRenta.mockRejectedValue(err);

        await Promise.all(validaciones.crearRenta.map(v => v(req, res, () => { })));
        await rentaController.crearRenta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            mensaje: expect.stringContaining('no existe')
        }));
    });

    test('Devolver código 409 si el vehículo ya está rentado', async () => {
        req.body = {
            idVehiculo: 'e4d909c2-901a-4d2b-b6d5-123456789abc',
            idUsuario: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
            fechaInicio: '2026-05-31T12:00:00.000Z',
            fechaFin: '2026-06-01T15:00:00.000Z',
            idTarjeta: 'f1e2d3c4-b5a6-7890-abcd-1234567890ab',
            cvv: '123'
        };

        const err = Object.assign(new Error('Lo sentimos, este vehículo ya no se encuentra disponible.'), { status: 409 });
        rentasServicio.ejecutarCreacionRenta.mockRejectedValue(err);

        await Promise.all(validaciones.crearRenta.map(v => v(req, res, () => { })));
        await rentaController.crearRenta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            mensaje: expect.stringContaining('disponible')
        }));
    });

    test('Procesar renta, enviar notificación y responder 201', async () => {
        req.body = {
            idVehiculo: 'e4d909c2-901a-4d2b-b6d5-123456789abc',
            idUsuario: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
            fechaInicio: '2026-05-31T12:00:00.000Z',
            fechaFin: '2026-06-01T15:00:00.000Z',
            idTarjeta: 'f1e2d3c4-b5a6-7890-abcd-1234567890ab',
            cvv: '123'
        };

        const mockRenta = { id: 1 };
        const mockNotificacion = { id: 10, tipo: 'RENTA_CREADA' };
        rentasServicio.ejecutarCreacionRenta.mockResolvedValue({
            renta: mockRenta,
            notificacion: mockNotificacion
        });

        await Promise.all(validaciones.crearRenta.map(v => v(req, res, () => { })));
        await rentaController.crearRenta(req, res, next);

        expect(rentasServicio.ejecutarCreacionRenta).toHaveBeenCalledWith(expect.objectContaining({
            idVehiculo: req.body.idVehiculo,
            idUsuario: req.body.idUsuario,
            idTarjeta: req.body.idTarjeta,
            cvv: req.body.cvv
        }));

        expect(servicioNotificacion.enviarNotificacion).toHaveBeenCalledWith(
            req.body.idUsuario,
            expect.objectContaining({ tipo: 'NUEVA_NOTIFICACION', datos: mockNotificacion })
        );

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            renta: mockRenta
        }));
    });
});

describe('Pruebas de Obtener Historial', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { params: {}, header: jest.fn() };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    test('Devolver código 404 si el usuario no existe', async () => {
        req.params = { idUsuario: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab' };

        Usuario.findByPk.mockResolvedValue(null);

        await Promise.all(validaciones.obtenerHistorial.map(v => v(req, res, () => { })));
        await rentaController.obtenerHistorial(req, res, next);

        expect(Usuario.findByPk).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            mensaje: expect.stringContaining('No se encontró el usuario')
        }));
    });

    test('Devolver código 200 y arreglo vacío si el usuario no tiene rentas', async () => {
        req.params = { idUsuario: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab' };

        Usuario.findByPk.mockResolvedValue({ id: req.params.idUsuario });
        Renta.findAll.mockResolvedValue([]);

        await Promise.all(validaciones.obtenerHistorial.map(v => v(req, res, () => { })));
        await rentaController.obtenerHistorial(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            mensaje: 'Sin rentas',
            datos: []
        }));
    });

    test('Devolver código 200 y el historial con los datos', async () => {
        req.params = { idUsuario: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab' };

        Usuario.findByPk.mockResolvedValue({ id: req.params.idUsuario });

        const historialMockeado = [
            {
                id: 1,
                fechaInicio: '2026-05-10T10:00:00Z',
                estadoRenta: 2,
                Vehiculo: {
                    id: 'v123',
                    modelo: 'Aveo',
                    placa: 'ABC-123',
                    Sucursal: { nombre: 'Sucursal Centro', direccion: 'Calle Juárez #403, Colonia Centro' },
                    Marca: { nombreMarca: 'Chevrolet' }
                }
            }
        ];

        Renta.findAll.mockResolvedValue(historialMockeado);

        await Promise.all(validaciones.obtenerHistorial.map(v => v(req, res, () => { })));
        await rentaController.obtenerHistorial(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);

        const respuesta = res.json.mock.calls[0][0];
        expect(respuesta.mensaje).toBe('Historial de rentas recuperado con éxito');
        expect(respuesta.datos).toHaveLength(1);
        expect(respuesta.datos[0].Vehiculo.Sucursal.nombre).toBe('Sucursal Centro');
        expect(respuesta.datos[0].Vehiculo.Marca.nombreMarca).toBe('Chevrolet');
    });
});

describe('Pruebas de Cancelar Renta', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { params: {}, header: jest.fn(), bitacora: jest.fn() };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    test('Devolver código 400 si el idRenta es inválido', async () => {
        req.params = { idRenta: 'abc' };

        await Promise.all(validaciones.cancelarRenta.map(v => v(req, res, () => {})));
        await rentaController.cancelarRenta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        const errores = res.json.mock.calls[0][0].errores;
        expect(errores).toHaveLength(1);
    });

    test('Devolver código 404 si la renta no existe', async () => {
        req.params = { idRenta: '99' };

        const err = Object.assign(new Error('La renta especificada no existe.'), { status: 404 });
        rentasServicio.ejecutarCancelacionRenta.mockRejectedValue(err);

        await Promise.all(validaciones.cancelarRenta.map(v => v(req, res, () => {})));
        await rentaController.cancelarRenta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            mensaje: expect.stringContaining('no existe')
        }));
    });

    test('Devolver código 409 si la renta ya no está en estado creada', async () => {
        req.params = { idRenta: '1' };

        const err = Object.assign(new Error('Solo se pueden cancelar rentas que aún no han iniciado.'), { status: 409 });
        rentasServicio.ejecutarCancelacionRenta.mockRejectedValue(err);

        await Promise.all(validaciones.cancelarRenta.map(v => v(req, res, () => {})));
        await rentaController.cancelarRenta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            mensaje: expect.stringContaining('no han iniciado')
        }));
    });

    test('Cancelar renta, enviar notificación y responder 200', async () => {
        req.params = { idRenta: '1' };

        const mockRenta = { id: 1, idUsuario: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', estadoRenta: 3 };
        const mockNotificacion = { id: 20, tipo: 'RENTA_CANCELADA' };
        rentasServicio.ejecutarCancelacionRenta.mockResolvedValue({
            renta: mockRenta,
            notificacion: mockNotificacion
        });

        await Promise.all(validaciones.cancelarRenta.map(v => v(req, res, () => {})));
        await rentaController.cancelarRenta(req, res, next);

        expect(rentasServicio.ejecutarCancelacionRenta).toHaveBeenCalledWith({ idRenta: '1' });

        expect(servicioNotificacion.enviarNotificacion).toHaveBeenCalledWith(
            mockRenta.idUsuario,
            expect.objectContaining({ tipo: 'NUEVA_NOTIFICACION', datos: mockNotificacion })
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            renta: mockRenta
        }));
    });
});

describe('Pruebas de Finalizar Renta', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { params: {}, header: jest.fn(), bitacora: jest.fn() };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    test('Devolver código 400 si el idRenta es inválido', async () => {
        req.params = { idRenta: 'abc' };

        await Promise.all(validaciones.finalizarRenta.map(v => v(req, res, () => {})));
        await rentaController.finalizarRenta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        const errores = res.json.mock.calls[0][0].errores;
        expect(errores).toHaveLength(1);
    });

    test('Devolver código 404 si la renta no existe', async () => {
        req.params = { idRenta: '99' };

        const err = Object.assign(new Error('La renta especificada no existe.'), { status: 404 });
        rentasServicio.ejecutarFinalizacionRenta.mockRejectedValue(err);

        await Promise.all(validaciones.finalizarRenta.map(v => v(req, res, () => {})));
        await rentaController.finalizarRenta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            mensaje: expect.stringContaining('no existe')
        }));
    });

    test('Devolver código 409 si la renta ya fue finalizada', async () => {
        req.params = { idRenta: '1' };

        const err = Object.assign(new Error('Esta renta ya fue finalizada.'), { status: 409 });
        rentasServicio.ejecutarFinalizacionRenta.mockRejectedValue(err);

        await Promise.all(validaciones.finalizarRenta.map(v => v(req, res, () => {})));
        await rentaController.finalizarRenta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            mensaje: expect.stringContaining('ya fue finalizada')
        }));
    });

    test('Finalizar renta a tiempo, sin recargo, y responder 200', async () => {
        req.params = { idRenta: '1' };

        const mockRenta = { id: 1, idUsuario: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', estadoRenta: 2 };
        const mockNotificacion = { id: 30, tipo: 'RENTA_FINALIZADA' };
        rentasServicio.ejecutarFinalizacionRenta.mockResolvedValue({
            renta: mockRenta,
            notificacion: mockNotificacion,
            recargo: { aplicaRecargo: false, montoRecargo: 0 }
        });

        await Promise.all(validaciones.finalizarRenta.map(v => v(req, res, () => {})));
        await rentaController.finalizarRenta(req, res, next);

        expect(servicioNotificacion.enviarNotificacion).toHaveBeenCalledWith(
            mockRenta.idUsuario,
            expect.objectContaining({ tipo: 'NUEVA_NOTIFICACION', datos: mockNotificacion })
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            recargo: 0,
            renta: mockRenta
        }));
    });

    test('Finalizar renta con retraso, aplicar recargo y responder 200', async () => {
        req.params = { idRenta: '1' };

        const mockRenta = { id: 1, idUsuario: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', estadoRenta: 4 };
        const mockNotificacion = { id: 31, tipo: 'RENTA_FINALIZADA' };
        rentasServicio.ejecutarFinalizacionRenta.mockResolvedValue({
            renta: mockRenta,
            notificacion: mockNotificacion,
            recargo: { aplicaRecargo: true, horasExtra: 2, montoRecargo: 100 }
        });

        await Promise.all(validaciones.finalizarRenta.map(v => v(req, res, () => {})));
        await rentaController.finalizarRenta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            recargo: 100,
            renta: mockRenta
        }));
    });
});
