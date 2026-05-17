const multer = require('multer')

const filtroExtension = (req, file, cb) => {
    console.log("Archivo: ", file.originalName, file.mimetype);
    if (file.mimetype.startsWith("image/")) {
        cb(null, false)
    } else {
        cb("Solo se permiten archivos de imagen", false)
    }
}

var almacenamiento = multer.diskStorage({
    destination: (req, res, cb) => {
        let tipo = req.body.tipo
        let path = `./uploads/${tipo}`
        cb(null, path)
    },
    filename: (req, res, cb)=>{
        cb(null, `${Date.now()}-${file.originalName}`)
    }
})

const subirArchivo = multer({storage: almacenamiento, fileFilter: filtroExtension})

module.exports = subirArchivo;