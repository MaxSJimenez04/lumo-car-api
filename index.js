const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./config/db')
const app = express();

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({extended: false}))

var corsOptions = {
    origin: 'http://localhost:8080',
    methods: 'GET,POST,PUT,DELETE'
}

app.use(cors(corsOptions))


async function iniciarServidor() {
    try {
        sequelize.authenticate();
        console.log('Conexión a base de datos establecida.')

        app.listen(process.env.SERVER_PORT, () => {
             console.log(`Servidor activo en puerto ${process.env.SERVER_PORT}...`)
        })
    } catch (error) {
        console.log('ERROR: No se pudo establecer conexión con la base de datos.', error);
    }
}

iniciarServidor();




