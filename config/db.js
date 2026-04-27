const { Sequelize } = require('sequelize');
const config = require('./config');

const env = process.env.NODE_ENV;
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: {
        options: {
            encrypt: true,
            trustServerCertificate: true
        }
    },
    logging: false
});


const probarConexion = async() => {
    try {
        await sequelize.authenticate();
        console.log('Se estableció la conexión con la base de datos...')
    } catch (error) {
        console.error('No se pudo establecer conexón con la base de datos' , error)
    }
}
module.exports = sequelize;
