const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./models')
const app = express();
const bitacoraLogger = require('./middlewares/bitacora.middleware')
const { iniciarScheduler } = require('./services/scheduler.service')

dotenv.config(); //Carga el contenido del .env

app.use(express.json()); //Usa únicamente JSON
app.use(express.urlencoded({extended: false}))

var corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE'  //Solo permite métodos GET, PUT, POST y DELETE
}

app.use(cors(corsOptions))
app.use(bitacoraLogger)

//ROUTES
app.use("/auth", require('./routes/auth.routes'))
app.use("/usuarios", require('./routes/usuarios.routes'))

app.use("/suscripciones", require('./routes/suscripciones.routes'))

app.use("/archivos", require('./routes/archivos.routes'))
app.use("/vehiculos",require('./routes/vehiculos.routes'))
app.use("/sucursales", require('./routes/sucursales.routes'))
app.use("/rentas", require('./routes/rentas.routes'))
app.use("/estadisticas", require('./routes/estadisticas.routes'))
app.get('/*splat', (req, res) => {res.status(404).send("RECURSO NO ENCONTRADO")})

async function iniciarServidor() {
    try {
        await db.sequelize.authenticate(); 
        console.log('Conexión a base de datos establecida.\n')

        //Si se requiere actualizar el modelo de base de datos
        await db.sequelize.sync();
        console.log('Modelo en Base de Datos actualizado.\n')

        iniciarScheduler();

        app.listen(process.env.SERVER_PORT, () => {
            console.log(`Servidor activo en puerto ${process.env.SERVER_PORT}...`)
        })
    } catch (error) {
        console.log('ERROR: No se pudo establecer conexión con la base de datos.\n', error);
    }
}

iniciarServidor();