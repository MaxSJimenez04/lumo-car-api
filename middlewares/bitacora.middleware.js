const requestip = require('request-ip')
const ClaimTypes = require('../config/claimtypes')
const fs = require('fs')
const { default: Date } = require('tedious/lib/data-types/date')
const path = require('path')

const bitacoraLogger = (req, res, next) => {
    const ip = requestip.getClientIp(req)
    let usuario = 'Invitado'

    req.bitacora = (accion) => {
        if (req.decodedToken) {
            usuario = decodedToken[ClaimTypes.Name]
        }

        //Registra en un archivo de texto
        let fecha = new Date().toISOString()
        const mensajeLog = `${fecha}: ACCIÓN: ${accion} - IP: ${ip} - USUARIO: ${usuario}`

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