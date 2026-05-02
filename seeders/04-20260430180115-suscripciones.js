/*Seeder para Suscripcion */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Suscripcion',[
      {nombre: 'LUMO Urbano', precio: 1200, 
        descripcion:'Tamaños disponibles: A, B y C. Tiempo de préstamo de vehículos: mayor a 15 días.', createdAt: new Date(), updatedAt: new Date()},
      {nombre: 'LUMO Ejecutivo', precio: 2500, 
        descripcion:'Tamaños disponibles: A,B,C,D y E. Tiempo de préstamo de vehículos: mayor a 1 mes. Lavado de Vehículos incluido', createdAt: new Date(), updatedAt: new Date()},
      {nombre: 'LUMO Urbano', precio: 3600, 
        descripcion:'Tamaños disponibles: A,B,C,D,E,F y s. Tiempo de préstamo de vehículos: mayor a 2 meses.Lavado de vehículos y seguro de cobertura total incluido.'
      , createdAt: new Date(), updatedAt: new Date()}
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Suscripcion', null, {})
  }
};
