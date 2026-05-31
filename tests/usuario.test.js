jest.mock('bcrypt', () =>({
    hash: jest.fn()
}))

jest.mock('crypto', () =>({
    randomUUID: jest.fn()
}))

jest.mock('../models', ()=>({
    Usuario: {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
        findAll: jest.fn()
    }
}))

const usuarios = require('../controllers/usuarios.controller');
const { header, body } = require('express-validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const {Usuario, Sequelize} = require('../models');
const { json } = require("sequelize")
const { usuarioValidator, validaciones } = require("../controllers/usuarios.controller")

describe('Pruebas de Gestionar Usuario', ()=>{
    let req, res, next;

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

    test('Devolver código de error si los datos son vacíos', async() => {
        req = {
            body:{
            id: '',
            usuario:'',
            contrasena: '',
            nombre: '',
            apellidos: '',
            correo: '',
            telefono: '',
            fecha: {
                ano: null,
                mes: null,
                dia: null
            },
            idRol: null
            }
        }
        await Promise.all(validaciones.crearUsuario.map(validation => validation(req, res,() => {})))
        usuarios.registro(req, res, next)
        expect(res.status).toHaveBeenCalledWith(400)
        const errores = res.json.mock.calls[0][0]
        expect(errores).toHaveLength(13)

    })
    
    test('Devolver código de error si los datos son muy grandes', async()=>{
        req = {
            usuario: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis expedita ea eaque, adipisci laudantium illo ipsum cumque minima aperiam harum architecto rem quam blanditiis? Magnam, inventore? Tempora maxime necessitatibus facilis.',
            contrasena: 'CONTRASEÑA EXAGERADAMENTE LARGA Y GRANDE PARA CABER EN LA BASE DE DATOS',
            nombre: 'Usuario',
            apellidos: 'Nuevo',
            correo: 'correo@ejemplo.com',
            telefono: '+550123456789',
            fecha: {
                ano: 2000,
                mes: 2,
                dia: 23
            },
            idRol: 3
        }

        await Promise.all(validaciones.crearUsuario.map(validation => validation(req, res,() => {})))
        usuarios.registro(req, res, next)
        expect(res.status).toHaveBeenCalledWith(400)
        const errores = res.json.mock.calls[0][0]
        expect(errores).toHaveLength(19)

    })

    test('Validar seguridad de la contraseña', async() =>{
        req =  {
            body:{
            usuario:'PruebaUsuario',
            contrasena: 'passwrd',
            nombre: 'Pedro',
            apellidos: 'Páramo',
            correo: 'correo@ejemplo.com',
            telefono: '+520123456789',
            fecha: {
                ano: 2001,
                mes: 3,
                dia: 4
            },
            idRol: 3
            }
        }

        await Promise.all(validaciones.crearUsuario.map(validation => validation(req, res,() => {})))
        usuarios.registro(req, res, next)
        expect(res.status).toHaveBeenCalledWith(400)
        const errores = res.json.mock.calls[0][0]
        expect(errores).toHaveLength(2)
        expect(errores[1].msg).toBe('Contraseña debe ser de 8 caracteres hasta 255')
        expect(errores[0].msg).toBe('La contraseña debe tener al menos un caracter especial y un número')
    })

    test('Comprobar que se hashea la contraseña', async()=>{
        req = {
            usuario:'PruebaUsuarioHash',
            contrasena: 'password@2001',
            nombre: 'Juan',
            apellidos: 'Rulfo',
            correo: 'correodeprueba@ejemplo.com',
            telefono: '+520123456789',
            fecha: {
                ano: 2001,
                mes: 3,
                dia: 4
            },
            idRol: 3
        }

        bcrypt.hash.mockResolvedValue('$2b$10$KG3bUp9LKpLD4Fo.J3Uy6uhWOs5io8kc02DQFRwz0zvEYr1FTrF6m')
        await Promise.all(validaciones.crearUsuario.map(validation => validation(req,res, ()=>{})))
        await usuarios.registro(req, res, next)
        expect(bcrypt.hash).toHaveBeenCalled();
    })

    test('Devolver código de error si el formato de correo no es correcto', async() =>{
        req = {
            usuario:'PruebaUsuarioHash',
            contrasena: 'password@2001',
            nombre: 'Juan',
            apellidos: 'Rulfo',
            correo: 'formato_incorrecto_correo',
            telefono: '+520123456789',
            fecha: {
                ano: 2001,
                mes: 3,
                dia: 4
            },
            idRol: 3
        }

        await Promise.all(validaciones.crearUsuario.map(validation => validation(req, res,() => {})))
        usuarios.registro(req, res, next)
        expect(res.status).toHaveBeenCalledWith(400)
        const errores = res.json.mock.calls[0][0]
        expect(errores[4].msg).toBe('Formato de correo inválido')
    })
})