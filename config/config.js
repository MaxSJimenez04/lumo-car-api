require('dotenv').config();

module.exports = {
    development:{
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: DB_DATABASE,
        host: DB_HOST,
        port: DB_PORT,
        dialect:'msserver'
    },
    test:{
        username: process.env.TEST_DB_USER,
        password: process.env.TEST_DB_PASSWORD,
        database: process.env.TEST_DATABASE,
        host: process.env.TEST_DB_PORT,
        port: process.env.TEST_DB_PORT,
        dialect:'msserver'
    }
}