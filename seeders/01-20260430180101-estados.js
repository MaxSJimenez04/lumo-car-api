/*Seeder para Estado y Ciudad */
'use strict';

const Estado = require('../models/Estado');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Estado', [
      {nombreEstado: 'Aguascalientes', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Baja California', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Baja California Sur', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Campeche', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Chiapas', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Chihuahua', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Ciudad de México', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Coahuila', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Colima', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Durango', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Estado de México', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Guanajuato', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Guerrero', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Hidalgo', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Jalisco', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Michoacán', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Morelos', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Nayarit', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Nuevo León', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Oaxaca', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Puebla', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Querétaro', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Quintana Roo', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'San Luis Potosí', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Sinaloa', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Sonora', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Tabasco', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Tamaulipas', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Tlaxcala', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Veracruz', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Yucatán', createdAt: new Date(), updatedAt: new Date()},
      {nombreEstado: 'Zacatecas', createdAt: new Date(), updatedAt: new Date()},
    ])

    await queryInterface.bulkInsert('Ciudad', [
      {nombreCiudad: 'Xalapa-Enríquez', idEstado: 30, createdAt: new Date(), updatedAt: new Date()},
      {nombreCiudad: 'Coatepec', idEstado: 30, createdAt: new Date(), updatedAt: new Date()},
      {nombreCiudad: 'Puebla de Zaragoza', idEstado: 21, createdAt: new Date(), updatedAt: new Date()}
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Ciudad', null, {})
    await queryInterface.bulkDelete('Estado', null, {})
  }
};
