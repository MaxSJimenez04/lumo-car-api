const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({extended: false}))

var corsOptions = {
    origin: 'http://localhost:8080',
    methods: 'GET,POST,PUT,DELETE'
}

app.use(cors(corsOptions))


app.listen(process.env.SERVER_PORT, () => {
    console.log(`Servidor corriendo en puerto ${process.env.SERVER_PORT}`)
})


