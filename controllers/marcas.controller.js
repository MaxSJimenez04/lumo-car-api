const {Marca, sequelize} = require('../models')

let self = {}

self.consultarMarcas = async function(req,res,next) {
    try {
        let marcas = await Marca.findAll()

        if (marcas === null) {
            return res.status(404).json({mensaje: "No se encontraron marcas"})
        }

        return res.status(200).json(marcas)
    } catch (error) {
        next(error)
    }
}

module.exports = self