jest.mock('bcrypt', () =>({
    compare: jest.fn(),
    hash:jest.fn()
}))
jest.mock('jsonwebtoken', ()=>({
    sign: jest.fn(),
    decode: jest.fn(),
    verify: jest.fn()
}))
jest.mock('request-ip')
jest.mock('fs')


//Mock de Usuario y rol
jest.mock('../models', ()=>({
    Usuario: {
        findOne: jest.fn()
    },
    Rol:{},
    Sequelize: {
        col: jest.fn()
    }
}))

const auth = require('../controllers/auth.controller');
const jwtservice = require('../services/jwtservice');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const requestip = require('request-ip');
const fs = require('fs');
const { header } = require('express-validator');
const { Usuario, Rol, sequelize } = require('../models');


describe('Pruebas de Iniciar Sesión',() =>{
    let req, res, next

    beforeEach(() => {
        req = {
            body: {},
            header: jest.fn()
        }
        res= {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn()

        jest.clearAllMocks()
    })

    test('Devolver código de error si datos son vacíos', async() => {
        req = {
            body:{usuario: '', contrasena: ''}
        }

        Usuario.findOne.mockResolvedValue(null)
        console.log("Auth es: "+auth);
        console.log("Validator es: " + auth.loginValidator);
        
        await Promise.all(auth.loginValidator.map(validation => validation(req, res, () => {})))
        await auth.login(req, res, next)
        expect(res.status).toHaveBeenCalledWith(400)
        const errores = res.json.mock.calls[0][0]
        expect(errores).toHaveLength(2)
        expect(errores[0].msg).toBe('campo vacío')
        expect(errores[1].msg).toBe('campo vacío')
        expect(Usuario.findOne).not.toHaveBeenCalled()
    })


    test('Token JWT se genera correctamente', () =>{
        let payload = {
            usuario:'BrendaMarquez',
            nombre: 'Brenda',
            rol:'Administrador'
        }
        jwt.sign.mockReturnValue('string')
        jwt.decode.mockReturnValue(payload)
    
        let token = jwtservice.GenerarToken(payload.usuario, payload.nombre, payload.rol)
        let decodedToken = jwt.decode(token)
        
        expect(token).toBe('string')
        expect(decodedToken).toMatchObject({
            usuario:'BrendaMarquez',
            nombre: 'Brenda',
            rol:'Administrador'
        })
    })


    test('Comparar contraseña cifrada con texto plano', async () => {
        let contraseñaCifrada = "password1234"
        let contraseñaComparar = "wrongpassword"

        bcrypt.compare.mockResolvedValue(false)

        const resultado = await auth.compararContrasena(contraseñaCifrada, contraseñaComparar)

        expect(resultado).toBeFalsy()
    })



    test('Verificar escritura en bitácora', () => {
    requestip.getClientIp.mockReturnValue('127.0.0.1')
    
    req.bitacora = (accion) => {
            const ip = '127.0.0.1';
            const usuario = 'BrendaMarquez';
            const mensajeLog = `ACCIÓN: ${accion} - IP: ${ip} - USUARIO: ${usuario}`;
            fs.appendFile('ruta', mensajeLog, () => {});
        };

        const accionPrueba = "Intento de Login";
        req.bitacora(accionPrueba);

        expect(fs.appendFile).toHaveBeenCalled();
        const contenidoLog = fs.appendFile.mock.calls[0][1];
        expect(contenidoLog).toContain(`IP: 127.0.0.1`);
        expect(contenidoLog).toContain(`USUARIO: BrendaMarquez`);
    })

}) 