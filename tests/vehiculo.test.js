jest.mock('../models', () =>({
    Vehiculo:{
        create: jest.fn()
    },
    Color:{
        create: jest.fn(),
        findOne: jest.fn()
    }
}))

const vehiculos = require('../controllers/vehiculos.controller')
const {validaciones} = require('../controllers/vehiculos.controller')
const {header,body} = require('express-validator')
const {Color, Vehiculo, sequelize} = require('../models')

describe('Pruebas de Gestionar Vehículo', ()=>{
    let req,res,next

    beforeEach(() => {
        req = {
            body: {},
            header: jest.fn()
        },
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        next = jest.fn()
    })

    test('Comprobar formato de Placa', async() =>{
        req = {
            body:{
                placa:'123HOLA12345',
                modelo: 'Verdan',
                pasajeros:5,
                transmision:false,
                tamano:'A',
                tipo_combustible:1,
                aire_acondicionado:true,
                idColor:1,
                idMarca:3,
                idSucursal:1
            }
        }

        await Promise.all(validaciones.registrarVehiculo.map(validation => validation(req,res,() => {})))
        vehiculos.registrar(req,res,next)
        expect(res.status).toHaveBeenCalledWith(400)
        const errores = res.json.mock.calls[0][0]
        expect(errores).toBeDefined();
    })

    test('Comprobar formato de código HEX', async() =>{
        req = {
            color: 'Azul Claro',
            codigoHex:'#azulclaro'
        }

        await Promise.all(validaciones.registrarColor.map(validation => validation(req,res,() => {})))
        vehiculos.registrarColor(req,res,next)
        expect(res.status).toHaveBeenCalledWith(400)
        const errores = res.json.mock.calls[0][0]
        expect(errores).toBeDefined();
    })
})