const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET
const {ClaimTypes} = require('../config/claimtypes')

const GenerarToken = (usuario, nombre, rol) => {
    const token = jwt.sign({
        [ClaimTypes.Name]: usuario,
        [ClaimTypes.GivenName]: nombre,
        [ClaimTypes.Role]: rol
    },
    jwtSecret,
    {
        expiresIn: '30m'
    })
    return token
}

const tiempoRestanteToken = (req) => {
    try {
        const authHeader = req.header('Authorization')
        const token = authHeader.split(' ')[1]
        const decodedToken = jwt.verify(token, jwtSecret)

        const tiempoRestante = (decodedToken.exp - (new Date().getTime() / 1000))
        const minutos = Math.floor(tiempoRestante / 60)
        const segundos = Math.floor(tiempoRestante - minutos * 60)
        return "00: " + minutos.toString().padStart(2 , "0") + ":" + segundos.toString().padStart(2, "0")
    } catch (error) {
        return null
    }
}

module.exports = {GenerarToken, tiempoRestanteToken}