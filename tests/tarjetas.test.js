jest.mock('../models', () => ({
    Tarjeta: {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn()
    },
    Usuario: {
        findOne: jest.fn()
    }
}));

jest.mock('express-validator', () => ({
    validationResult: jest.fn(),
    body: jest.fn(() => ({ notEmpty: jest.fn().mockReturnThis(), bail: jest.fn().mockReturnThis(), isString: jest.fn().mockReturnThis(), isLength: jest.fn().mockReturnThis(), isNumeric: jest.fn().mockReturnThis(), matches: jest.fn().mockReturnThis(), withMessage: jest.fn().mockReturnThis() })),
    param: jest.fn(() => ({ isUUID: jest.fn().mockReturnThis(), notEmpty: jest.fn().mockReturnThis(), withMessage: jest.fn().mockReturnThis() }))
}));

const tarjetasController = require('../controllers/tarjetas.controller');
const { Tarjeta, Usuario } = require('../models');
const { validationResult } = require('express-validator');
const { ClaimTypes } = require('../config/claimtypes');

const MOCK_ID_USUARIO = 'a1b2c3d4-e5f6-7890-abcd-111111111111';
const MOCK_ID_TARJETA = 'b2c3d4e5-f6a7-8901-bcde-222222222222';

const sinErrores = { isEmpty: () => true, array: () => [] };
const conErrores = { isEmpty: () => false, array: () => [{ msg: 'Campo inválido' }] };

describe('Pruebas de Obtener Tarjetas', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            decodedToken: { [ClaimTypes.Name]: 'usuarioPrueba' }
        };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    test('Devolver lista de tarjetas del usuario (Status 200)', async () => {
        const tarjetasSimuladas = [
            { id: MOCK_ID_TARJETA, numeroTarjeta: '123456789012345678901', titular: 'Juan Pérez', fechaVencimiento: '12/28' }
        ];
        Usuario.findOne.mockResolvedValue({ id: MOCK_ID_USUARIO });
        Tarjeta.findAll.mockResolvedValue(tarjetasSimuladas);

        await tarjetasController.obtenerTarjetas(req, res, next);

        expect(Usuario.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { usuario: 'usuarioPrueba' } }));
        expect(Tarjeta.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { idCliente: MOCK_ID_USUARIO } }));
        expect(res.json).toHaveBeenCalledWith({ ok: true, tarjetas: tarjetasSimuladas });
    });

    test('Llamar next con error si el usuario no existe', async () => {
        Usuario.findOne.mockResolvedValue(null);

        await tarjetasController.obtenerTarjetas(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});

describe('Pruebas de Guardar Tarjeta', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            decodedToken: { [ClaimTypes.Name]: 'usuarioPrueba' },
            body: {
                numeroTarjeta: '123456789012345678901',
                cvv: '123',
                titular: 'Juan Pérez',
                fechaVencimiento: '12/28'
            },
            bitacora: jest.fn()
        };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    test('Guardar tarjeta exitosamente y responder 201', async () => {
        validationResult.mockReturnValue(sinErrores);
        Usuario.findOne.mockResolvedValue({ id: MOCK_ID_USUARIO });

        const tarjetaCreada = {
            id: MOCK_ID_TARJETA,
            numeroTarjeta: req.body.numeroTarjeta,
            titular: req.body.titular,
            fechaVencimiento: req.body.fechaVencimiento
        };
        Tarjeta.create.mockResolvedValue(tarjetaCreada);

        await tarjetasController.guardarTarjeta(req, res, next);

        expect(Tarjeta.create).toHaveBeenCalledWith(expect.objectContaining({
            numeroTarjeta: req.body.numeroTarjeta,
            cvv: req.body.cvv,
            titular: req.body.titular,
            idCliente: MOCK_ID_USUARIO
        }));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            ok: true,
            msg: 'Tarjeta guardada correctamente.',
            tarjeta: expect.objectContaining({ id: MOCK_ID_TARJETA })
        }));
    });

    test('Devolver 400 si hay errores de validación', async () => {
        validationResult.mockReturnValue(conErrores);

        await tarjetasController.guardarTarjeta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(Tarjeta.create).not.toHaveBeenCalled();
    });

    test('Llamar next con error si el usuario no existe', async () => {
        validationResult.mockReturnValue(sinErrores);
        Usuario.findOne.mockResolvedValue(null);

        await tarjetasController.guardarTarjeta(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(Tarjeta.create).not.toHaveBeenCalled();
    });
});

describe('Pruebas de Eliminar Tarjeta', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            decodedToken: { [ClaimTypes.Name]: 'usuarioPrueba' },
            params: { id: MOCK_ID_TARJETA },
            bitacora: jest.fn()
        };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
        next = jest.fn();
    });

    test('Eliminar tarjeta exitosamente y responder 204', async () => {
        validationResult.mockReturnValue(sinErrores);
        Usuario.findOne.mockResolvedValue({ id: MOCK_ID_USUARIO });

        const mockTarjeta = { id: MOCK_ID_TARJETA, destroy: jest.fn().mockResolvedValue() };
        Tarjeta.findOne.mockResolvedValue(mockTarjeta);

        await tarjetasController.eliminarTarjeta(req, res, next);

        expect(Tarjeta.findOne).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: MOCK_ID_TARJETA, idCliente: MOCK_ID_USUARIO }
        }));
        expect(mockTarjeta.destroy).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    test('Devolver 404 si la tarjeta no existe o no pertenece al usuario', async () => {
        validationResult.mockReturnValue(sinErrores);
        Usuario.findOne.mockResolvedValue({ id: MOCK_ID_USUARIO });
        Tarjeta.findOne.mockResolvedValue(null);

        await tarjetasController.eliminarTarjeta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: false, msg: 'Tarjeta no encontrada.' }));
    });

    test('Devolver 400 si hay errores de validación', async () => {
        validationResult.mockReturnValue(conErrores);

        await tarjetasController.eliminarTarjeta(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(Tarjeta.findOne).not.toHaveBeenCalled();
    });
});
