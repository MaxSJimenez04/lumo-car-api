jest.mock('../models', () => ({
    Renta: { findAll: jest.fn() },
    Pago: { findAll: jest.fn() },
    Vehiculo: {},
    Sucursal: {},
    Marca: {},
    Usuario: { count: jest.fn() },
    Rol: {},
    SuscripcionUsuario: { findAll: jest.fn() },
    Suscripcion: {}
}));

jest.mock('../middlewares/bitacora.middleware', () => jest.fn((req, res, next) => next()));

const estadisticasController = require('../controllers/estadisticas.controller');
const { Renta, Pago, Usuario, SuscripcionUsuario } = require('../models');

describe('Pruebas de Estadísticas de Rentas', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {};
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    test('Devolver 200 con mensaje si no hay registros', async () => {
        Renta.findAll.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

        await estadisticasController.estadisticasRentas(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            mensaje: 'No se tienen registros para hacer estadísticas.'
        }));
    });

    test('Devolver 200 con rentas agrupadas por sucursal y por vehículo', async () => {
        const porSucursalMock = [
            {
                totalRentas: '5',
                Vehiculo: { Sucursal: { id: 1, nombre: 'Sucursal Norte', direccion: 'Av. Norte #123' } }
            }
        ];
        const porVehiculoMock = [
            {
                totalRentas: '3',
                Vehiculo: { modelo: 'Corolla', placa: 'ABC-123', Marca: { nombreMarca: 'Toyota' } }
            }
        ];

        Renta.findAll
            .mockResolvedValueOnce(porSucursalMock)
            .mockResolvedValueOnce(porVehiculoMock);

        await estadisticasController.estadisticasRentas(req, res, next);

        expect(Renta.findAll).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledWith(200);
        const respuesta = res.json.mock.calls[0][0];
        expect(respuesta.porSucursal).toHaveLength(1);
        expect(respuesta.porVehiculo).toHaveLength(1);
    });
});

describe('Pruebas de Estadísticas de Suscripciones', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {};
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    test('Devolver 200 con mensaje si no hay suscripciones', async () => {
        SuscripcionUsuario.findAll.mockResolvedValue([]);

        await estadisticasController.estadisticasSuscripciones(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            mensaje: 'No se tienen registros para hacer estadísticas.'
        }));
    });

    test('Devolver 200 con totales calculados correctamente', async () => {
        SuscripcionUsuario.findAll.mockResolvedValue([
            { mes: '2025-03', total: '3', ingresos: '450.00' },
            { mes: '2025-04', total: '5', ingresos: '750.00' }
        ]);

        await estadisticasController.estadisticasSuscripciones(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        const respuesta = res.json.mock.calls[0][0];
        expect(respuesta.porMes).toHaveLength(2);
        expect(respuesta.totalSuscripciones).toBe(8);
        expect(respuesta.totalIngresos).toBeCloseTo(1200);
    });
});

describe('Pruebas de Estadísticas de Usuarios', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {};
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    test('Devolver 200 con totalClientes en 0 si no hay clientes registrados', async () => {
        Usuario.count.mockResolvedValue(0);

        await estadisticasController.estadisticasUsuarios(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ totalClientes: 0 });
    });

    test('Devolver 200 con el total de clientes registrados', async () => {
        Usuario.count.mockResolvedValue(42);

        await estadisticasController.estadisticasUsuarios(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ totalClientes: 42 });
    });
});

describe('Pruebas de Estadísticas de Uso de Vehículos', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {};
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    test('Devolver 200 con mensaje si no hay rentas completadas', async () => {
        Renta.findAll.mockResolvedValue([]);

        await estadisticasController.estadisticasUsoVehiculos(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            mensaje: 'No se tienen registros para hacer estadísticas.'
        }));
    });

    test('Devolver 200 con el uso agrupado correctamente por sucursal', async () => {
        Renta.findAll.mockResolvedValue([
            {
                totalUsos: '3', totalHoras: '24',
                Vehiculo: {
                    modelo: 'Corolla',
                    Sucursal: { id: 1, nombre: 'Norte', direccion: 'Av. Norte #1' },
                    Marca: { nombreMarca: 'Toyota' }
                }
            },
            {
                totalUsos: '5', totalHoras: '40',
                Vehiculo: {
                    modelo: 'Jetta',
                    Sucursal: { id: 1, nombre: 'Norte', direccion: 'Av. Norte #1' },
                    Marca: { nombreMarca: 'Volkswagen' }
                }
            },
            {
                totalUsos: '2', totalHoras: '16',
                Vehiculo: {
                    modelo: 'Aveo',
                    Sucursal: { id: 2, nombre: 'Sur', direccion: 'Av. Sur #2' },
                    Marca: { nombreMarca: 'Chevrolet' }
                }
            }
        ]);

        await estadisticasController.estadisticasUsoVehiculos(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        const { sucursales } = res.json.mock.calls[0][0];
        expect(sucursales).toHaveLength(2);
        expect(sucursales[0].sucursal.nombre).toBe('Norte');
        expect(sucursales[0].vehiculos).toHaveLength(2);
        expect(sucursales[0].vehiculos[0]).toMatchObject({ marca: 'Toyota', modelo: 'Corolla', totalUsos: 3, totalHoras: 24 });
        expect(sucursales[1].sucursal.nombre).toBe('Sur');
        expect(sucursales[1].vehiculos).toHaveLength(1);
    });
});

describe('Pruebas de Estadísticas de Ingresos', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {};
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    test('Devolver 200 con todos los totales en 0 si no hay pagos', async () => {
        Pago.findAll.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

        await estadisticasController.estadisticasIngresos(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        const respuesta = res.json.mock.calls[0][0];
        expect(respuesta.rentas.total).toBe(0);
        expect(respuesta.suscripciones.total).toBe(0);
        expect(respuesta.totalGeneral).toBe(0);
    });

    test('Devolver 200 con ingresos por rentas, suscripciones y total general correctos', async () => {
        Pago.findAll
            .mockResolvedValueOnce([
                { mes: '2025-03', ingresos: '1500.00', numeroPagos: '6' },
                { mes: '2025-04', ingresos: '2000.00', numeroPagos: '8' }
            ])
            .mockResolvedValueOnce([
                { mes: '2025-03', ingresos: '450.00', numeroPagos: '3' }
            ]);

        await estadisticasController.estadisticasIngresos(req, res, next);

        expect(Pago.findAll).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledWith(200);
        const respuesta = res.json.mock.calls[0][0];
        expect(respuesta.rentas.porMes).toHaveLength(2);
        expect(respuesta.rentas.total).toBeCloseTo(3500);
        expect(respuesta.suscripciones.porMes).toHaveLength(1);
        expect(respuesta.suscripciones.total).toBeCloseTo(450);
        expect(respuesta.totalGeneral).toBeCloseTo(3950);
    });
});
