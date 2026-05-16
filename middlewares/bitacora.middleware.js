const requestip = require('request-ip')
const ClaimTypes = require('../config/claimtypes')
const fs = require('fs')
const path = require('path')

const bitacoraLogger = (req, res, next) => {
    const ip = requestip.getClientIp(req)
    req.bitacora = (accion) => {
        let usuario = 'Invitado'
        if (req.decodedToken) {
            usuario = req.decodedToken[ClaimTypes.Name]
        }

        //Registra en un archivo de texto
        const fecha = new Date().toISOString()
        const mensajeLog = `${fecha}: ACCIÓN: ${accion} - IP: ${ip} - USUARIO: ${usuario} \n`
        const rutaLog = path.join(__dirname, '../log/log.txt')

        fs.appendFile(rutaLog, mensajeLog, (err) =>{
            if (err) {
                console.error('Error al escribir en la bitácora: ', err)
            }
        })
    }

    next()
}

module.exports = bitacoraLogger