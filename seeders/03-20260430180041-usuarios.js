/*Seeder para  Usuario y Rol*/
'use strict';

const bcrypt = require('bcrypt')
const crypto = require('crypto');
const { query } = require('express-validator');
const { DATE } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Rol',[
      {nombreRol: 'S_Administrador', createdAt: new Date(), updatedAt: new Date()},
      {nombreRol: 'Administrador', createdAt: new Date(), updatedAt: new Date()},
      {nombreRol: 'Cliente', createdAt: new Date(), updatedAt: new Date()}
    ])


    await queryInterface.bulkInsert('Usuario',[
      {id: crypto.randomUUID(), usuario: 'Sadministrador001',contrasena: await bcrypt.hash('Contrasen@1234', 10),
        nombre: 'Administrador', correo: 'administrador01@lumocar.com', idRol: 1, createdAt: new Date(), updatedAt: new Date()},
      {id: crypto.randomUUID(), usuario: 'EnriquePerez', contrasena: await bcrypt.hash('password1234', 10), nombre: 'Enrique', apellidos: 'Pérez González', 
        correo: 'enrpergnz@lumocar.com', telefono: '+523113503156', fecha_nacimiento: new Date(2000, 11, 21), idRol: 2,idSucursal:1, createdAt: new Date(), updatedAt:new Date()},
      {id: crypto.randomUUID(), usuario: 'BrendaMarquez', contrasena: await bcrypt.hash('password1234', 10), nombre: 'Brenda', apellidos: 'Marquéz Venegas', 
        correo: 'brndmarq@lumocar.com', telefono: '+523562161157', fecha_nacimiento: new Date(1999, 3, 6), idRol: 2, idSucursal:3 ,createdAt: new Date(), updatedAt:new Date()},
      {id: crypto.randomUUID(), usuario: 'PedroTorres', contrasena: await bcrypt.hash('password1234', 10), nombre: 'Pedro', apellidos: 'Torres Gutierrez', 
        correo: 'pdrtorr@lumocar.com', telefono: '+525912304678', fecha_nacimiento: new Date(2000, 11, 21), idRol: 2, idSucursal:2,createdAt: new Date(), updatedAt:new Date()},
      {id: crypto.randomUUID(), usuario: 'LuciaLopez1986', contrasena: await bcrypt.hash('contrasena1234', 10),nombre: 'Lucia', apellidos: 'López Zúñiga',
        correo: 'lucylpzn@gmail.com', telefono:'+5263124521363', fecha_nacimiento: new Date(1983, 10, 9),  idRol: 3, createdAt: new Date(), updatedAt:new Date()},
      {id: crypto.randomUUID(), usuario: 'CarlosRuiz90', contrasena: await bcrypt.hash('contrasena1234', 10), nombre: 'Carlos',apellidos: 'Ruiz Morales',
        correo: 'cruiz.morales@outlook.com', telefono: '+525512345678', fecha_nacimiento: new Date(1990, 4, 12), idRol: 3, createdAt: new Date(), updatedAt: new Date()},
      {id: crypto.randomUUID(),usuario: 'MarianaGomezV', contrasena: await bcrypt.hash('contrasena1234', 10), nombre: 'Mariana',apellidos: 'Gómez Valdivia',
        correo: 'm.gomez.v@hotmail.com', telefono: '+523398765432', fecha_nacimiento: new Date(1995, 7, 24), idRol: 3, createdAt: new Date(),updatedAt: new Date()},
      {id: crypto.randomUUID(), usuario: 'ElenaRivas82', contrasena: await bcrypt.hash('contrasena1234', 10), nombre: 'Elena', apellidos: 'Rivas Castañeda',
        correo: 'elena.rivas82@yahoo.com', telefono: '+524423145678', fecha_nacimiento: new Date(1982, 10, 15), idRol: 3, createdAt: new Date(), updatedAt: new Date()},
      {id: crypto.randomUUID(), usuario: 'DiegoFerrer93', contrasena: await bcrypt.hash('contrasena1234', 10), nombre: 'Diego', apellidos: 'Ferrer Salgado',
        correo: 'dferrer.salgado@gmail.com', telefono: '+522227654321', fecha_nacimiento: new Date(1993, 5, 30), idRol: 3, createdAt: new Date(), updatedAt: new Date()},
      {id: crypto.randomUUID(), usuario: 'MarcoGmez13', contrasena: await bcrypt.hash('contrasena1234', 10), nombre: 'Marcos', apellidos: 'López Santos',
        correo: 'marquitooos2003@gmail.com', telefono: '+52366261515',fecha_nacimiento: new Date(2003, 9, 23), idRol: 3, createdAt: new Date(), updatedAt: new Date()} 
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Usuario', null, {})
    await queryInterface.bulkDelete('Rol', null, {})
    
  }
};
