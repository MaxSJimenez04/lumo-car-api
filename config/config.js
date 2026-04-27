require('dotenv').config();

module.exports = {
    development:{
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect:'mssql'
    },
    test:{
        username: process.env.TEST_DB_USER,
        password: process.env.TEST_DB_PASSWORD,
        database: process.env.TEST_DATABASE,
        host: process.env.TEST_DB_PORT,
        port: process.env.TEST_DB_PORT,
        dialect:'mssql'
    }
}