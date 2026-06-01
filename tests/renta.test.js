const { UPDATE } = require("sequelize/lib/query-types");

const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
    LOCK: { UPDATE: 'UPDATE' }
};

jest.mock('../models', () => {
    return {
        sequelize: {
            transaction: jest.fn(() => Promise.resolve(mockTransaction)),

            queryInterface: {
                describeTable: jest.fn().mockResolvedValue({})
            },

            models: {}
        },

        Sequelize: {
            Op: {}
        },

        Vehiculo: {
            findByPk: jest.fn()
        },
        Renta: {
            create: jest.fn(),
            findAll: jest.fn()
        },
        Usuario: {
            findByPk: jest.fn()
        },
        Sucursal: { nombre: 'Sucursal' },
        Marca: { nombreMarca: 'Marca' }
    };
});

jest.mock('../middlewares/bitacora.middleware', () => {
    return jest.fn((req, res, next) => next());
});

const rentaController = require('../controllers/rentas.controller');
const { validaciones } = require('../controllers/rentas.controller');
const { Vehiculo, Renta, sequelize, Sucursal, Marca, Usuario } = require('../models');

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

    test('Devolver código 400 si faltan datos obligatorio o son inválidos', async () => {
        req.body = {
            idVehiculo: '',
            idUsuario: 'uno',
            fechaInicio: '19/05/2026',
            fechaFin: '20/05/2026'
        };

        await Promise.all(validaciones.crearRenta.map(validacion => validacion(req, res, () => { })));

        await rentaController.crearRenta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        const errores = res.json.mock.calls[0][0].errores;
        expect(errores).toHaveLength(4);
    });

    test('Devolver código código 400 si la fechaFin es anterior a la fechaInicio', async () => {
        req.body = {
            idVehiculo: 'e4d909c2-901a-4d2b-b6d5-123456789abc',
            idUsuario: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
            fechaInicio: '2026-05-31T12:00:00.000Z',
            fechaFin: '2020-01-01T15:00:00.000Z'
        };

        await Promise.all(validaciones.crearRenta.map(validacion => validacion(req, res, () => { })));
        await rentaController.crearRenta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            mensaje: expect.stringContaining('debe ser posterior')
        }));
    });

    test('Devolver código 404 y hacer rollback si el vehículo no existe', async () => {
        req.body = {
            idVehiculo: 'e4d909c2-901a-4d2b-b6d5-123456789abc',
            idUsuario: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
            fechaInicio: '2026-05-31T12:00:00.000Z',
            fechaFin: '2026-06-01T15:00:00.000Z'
        };

        Vehiculo.findByPk.mockResolvedValue(null);

        await Promise.all(validaciones.crearRenta.map(validacion => validacion(req, res, () => { })));
        await rentaController.crearRenta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    test('Devolver código 409 y hacer un rollback si el vehículo ya está rentado', async () => {
        req.body = {
            idVehiculo: 'e4d909c2-901a-4d2b-b6d5-123456789abc',
            idUsuario: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
            fechaInicio: '2026-05-31T12:00:00.000Z',
            fechaFin: '2026-06-01T15:00:00.000Z'
        };

        const mockVehiculoOcupado = { estado: 2 };
        Vehiculo.findByPk.mockResolvedValue(mockVehiculoOcupado);

        await Promise.all(validaciones.crearRenta.map(validacion => validacion(req, res, () => { })));
        await rentaController.crearRenta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    test('Procesar renta, guardar datos y hacer commit a la transacción', async () => {
        req.body = {
            idVehiculo: 'e4d909c2-901a-4d2b-b6d5-123456789abc',
            idUsuario: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
            fechaInicio: '2026-05-31T12:00:00.000Z',
            fechaFin: '2026-06-01T15:00:00.000Z'
        };

        const mockVehiculoDisponible = {
            estado: 1,
            save: jest.fn().mockResolvedValue(true)
        };

        Vehiculo.findByPk.mockResolvedValue(mockVehiculoDisponible);

        const mockRentaGenerada = { id: 1 };
        Renta.create.mockResolvedValue(mockRentaGenerada);

        await Promise.all(validaciones.crearRenta.map(validacion => validacion(req, res, () => { })));
        await rentaController.crearRenta(req, res, next);

        expect(Vehiculo.findByPk).toHaveBeenCalledWith(req.body.idVehiculo, {
            transaction: mockTransaction,
            lock: 'UPDATE'
        });

        expect(mockVehiculoDisponible.estado).toBe(2);
        expect(mockVehiculoDisponible.save).toHaveBeenCalled();
        expect(Renta.create).toHaveBeenCalled();

        expect(mockTransaction.commit).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            renta: mockRentaGenerada
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

        await Promise.all(validaciones.obtenerHistorial.map(validacion => validacion(req, res, () => { })));
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

        await Promise.all(validaciones.obtenerHistorial.map(validacion => validacion(req, res, () => { })));
        await rentaController.obtenerHistorial(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            mensaje: "Sin rentas",
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
                estadoRenta: 'Completado',
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

        await Promise.all(validaciones.obtenerHistorial.map(validacion => validacion(req, res, () => {})));
        await rentaController.obtenerHistorial(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);

        const respuesta = res.json.mock.calls[0][0];
        expect(respuesta.mensaje).toBe('Historial de rentas recuperado con éxito');
        expect(respuesta.datos).toHaveLength(1);
        expect(respuesta.datos[0].Vehiculo.Sucursal.nombre).toBe('Sucursal Centro')
        expect(respuesta.datos[0].Vehiculo.Marca.nombreMarca).toBe('Chevrolet');
    });
});