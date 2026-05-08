const fs = require('fs')
const requestip = require('request-ip')
const {ClaimTypes} = require('../config/claimtypes')

const errorHandler = (err, req, res, next) => {
    let mensaje = 'No se ha podido procesar la petición. Intente de nuevo más tarde.'
    const statusCode = err.statusCode || 500
    const ip = requestip.getClientIp(req)

    let usuario = "Anónimo",
    if (req.decodedToken) {
        usuario =  req.decodedToken[ClaimTypes.Name]
    }

    let fecha = new Date().toISOString
    const mensajeError = `${fecha}: CODE: ${statusCode} - ${ip} - ${usuario} - ${err.message || mensaje} \n`
    fs.appendFile('errorLog.txt', err =>{
        if (err) {
            console.error(err)
        }
    })
}