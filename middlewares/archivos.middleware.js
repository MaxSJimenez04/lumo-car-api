const multer = require('multer')

const filtroExtension = (req, file, cb) => {
    console.log("Archivo: ", file.originalname, file.mimetype);

    if (file.mimetype.startsWith("image/")) {
        cb(null, true)
    } else {
        cb(new Error("Solo se permiten archivos de imagen"), false)
    }
}

const crearUpload = (carpeta) => {

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, `./uploads/${carpeta}`);
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    });

    return multer({ storage });
};


module.exports = {
    uploadUsuarios: crearUpload("usuarios"),
    uploadVehiculos: crearUpload("vehiculos"),
    uploadVehiculosMultiple:  crearUpload("vehiculos")
};