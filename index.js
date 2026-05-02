const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./models')
const app = express();

dotenv.config(); //Carga el contenido del .env

app.use(express.json()); //Usa únicamente JSON
app.use(express.urlencoded({extended: false}))

var corsOptions = {
    origin: 'http://localhost:8080',
    methods: 'GET,POST,PUT,DELETE'  //Solo permite métodos GET, PUT, POST y DELETE
}

app.use(cors(corsOptions))

app.use("/archivos", require('./routes/archivos.routes'))
app.use("/auth", require('./routes/auth.routes'))
app.use("/estadisticas", require('./routes/estadisticas.routes'))
app.use("/marcas", require('./routes/marcas.routes'))
app.use("/pagos", require('./routes/pagos.routes'))
app.use("/rentas", require('./routes/rentas.routes'))
app.use("/roles", require('./routes/roles.routes'))
app.use("/sucursales", require('./routes/sucursales.routes'))
app.use("/suscripciones", require('./routes/suscripciones.routes'))
app.use("/tarjetas", require('./routes/tarjetas.routes'))
app.use("/usuarios", require('./routes/usuarios.routes'))
app.use("/vehiculos", require('./routes/vehiculos.routes'))
app.get('/*splat', (req, res) => {res.status(404).send("RECURSO NO ENCONTRADO")})

async function iniciarServidor() {
    try {
        await db.sequelize.authenticate(); //Se intenta conectar a la base de datos usando el usuario y contraseña
        console.log('Conexión a base de datos establecida.\n')

        await db.sequelize.sync();
        console.log('Modelo en Base de Datos actualizado.\n')

        app.listen(process.env.SERVER_PORT, () => {
             console.log(`Servidor activo en puerto ${process.env.SERVER_PORT}...`)
        })
    } catch (error) {
        console.log('ERROR: No se pudo establecer conexión con la base de datos.\n', error);
    }
}

iniciarServidor();