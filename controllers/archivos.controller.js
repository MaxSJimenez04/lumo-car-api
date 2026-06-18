const {Archivo} = require('../models')
const fs = require('fs')
const crypto = require('crypto')
const bitacora = require('../middlewares/bitacora.middleware')

let self = {}

self.crearUsuario = async (req, res, next) => {
    try {

        const datos = await guardarArchivo(
            req,
            "usuarios"
        );

        return res.status(201).json({
            detalles: datos
        });

    } catch (error) {
        next(error);
    }
};

self.crearVehiculo = async (req, res, next) => {
    try {
        const datos = await guardarArchivo(
            req,
            "vehiculos"
        );

        return res.status(201).json({
            detalles: datos
        });

    } catch (error) {
        next(error);
    }
}

self.eliminar = async function(req, res, next) {
    try {
        const id = req.params.id
        let imagen  = await Archivo.findByPk(id,{attributes:['id','ruta', 'nombreArchivo']})
        if (imagen === null || imagen === undefined) {
            return res.status(404).json({mensaje: "No se encontró la imagen"})
        }

        let datos = await Archivo.destroy({where:{id: id}})

        if (datos === 1) {
            if (req.bitacora) {
                req.bitacora(`ELIMINAR IMAGEN CON ID ${id}`)
            }
            /*MODIFICAR ESTA SECCIÓN SI SE ALMACENAN LOS ARCHIVOS EN BASE DE DATOS*/
            fs.existsSync(imagen.ruta) && fs.unlinkSync(imagen.ruta)
            return res.status(204).send()
        }

        return res.status(404).json({mensaje: "No se pudo encontrar la imagen para eliminar"})
    } catch (error) {
        next(error)
    }
}

async function guardarArchivo(req, carpeta) {


    /*let binario = null; Datos para guardar en BASE DE DATOS
    let indb = false;*/

    if (!req.file) {
        throw new Error("El archivo es obligatorio");
    }

    const ruta = `/uploads/${carpeta}/${req.file.filename}`;

    if (process.env.FILES_IN_BD == "true") {
            /*En esta implementación no se requiere guardar los archivos en la base de datos
            Pero si se requiere en otras implementaciones se debe implementar la creación del objeto aquí */
            indb = true
    }
    const datos = await Archivo.create({
        id: crypto.randomUUID(),
        nombreOriginal: req.file.originalname,
        nombreArchivo: req.file.filename,
        ruta
    });

    return datos;
}

module.exports = self