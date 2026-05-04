/*Seeder para Vehiculo, Color, Marca y Sucursales */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Marca',[
      {nombreMarca: 'Toyota', createdAt: new Date(), updatedAt: new Date()},
      {nombreMarca: 'Honda', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Ford', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Chevrolet', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Nissan', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Volkswagen', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'BMW', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Mercedes-Benz', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Audi', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Hyundai', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Kia', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Mazda', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Subaru', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Lexus', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Porsche', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Ferrari', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Lamborghini', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Jeep', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Tesla', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Volvo', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Mitsubishi', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Land Rover', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Jaguar', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Peugeot', createdAt: new Date(), updatedAt: new Date()}, 
      {nombreMarca: 'Renault', createdAt: new Date(), updatedAt: new Date()}
    ])

    await queryInterface.bulkInsert('Color', [
      { color: 'Blanco', codigoHex: '#ffffff', createdAt: new Date(), updatedAt: new Date()},
      { color: 'Negro', codigoHex: '#000000', createdAt: new Date(), updatedAt: new Date() },
      { color: 'Gris Plata', codigoHex: '#C0C0C0' , createdAt: new Date(), updatedAt: new Date()},
      { color: 'Gris Carbón', codigoHex: '#36454F' , createdAt: new Date(), updatedAt: new Date()},
      { color: 'Azul Marino', codigoHex: '#000080', createdAt: new Date(), updatedAt: new Date() },
      { color: 'Rojo Brillante', codigoHex: '#FF0000', createdAt: new Date(), updatedAt: new Date() },
      { color: 'Azul Eléctrico', codigoHex: '#0033FF', createdAt: new Date(), updatedAt: new Date() },
      { color: 'Beige', codigoHex: '#F5F5DC', createdAt: new Date(), updatedAt: new Date() },
      { color: 'Vino', codigoHex: '#722F37', createdAt: new Date(), updatedAt: new Date() },
      { color: 'Verde Botella', codigoHex: '#006400', createdAt: new Date(), updatedAt: new Date() },
      { color: 'Café', codigoHex: '#4B3621' , createdAt: new Date(), updatedAt: new Date()},
      { color: 'Naranja Metálico', codigoHex: '#FF8C00', createdAt: new Date(), updatedAt: new Date() },
      { color: 'Amarillo', codigoHex: '#FFD700', createdAt: new Date(), updatedAt: new Date() },
      { color: 'Bronce', codigoHex: '#CD7F32', createdAt: new Date(), updatedAt: new Date() },
      { color: 'Champagne', codigoHex: '#F7E7CE', createdAt: new Date(), updatedAt: new Date() }
    ])

    await queryInterface.bulkInsert('Sucursal',[
      {nombre: 'Sucursal 20 de Noviembre', direccion: 'Av. 20 de Noviembre 278', capacidad: 250, idCiudad: 1, createdAt: new Date(), updatedAt: new Date()},
      {nombre: 'Sucursal Avenida Américas', direccion: 'Av. Américas 37A', capacidad: 350, idCiudad: 1, createdAt: new Date(), updatedAt: new Date()},
      {nombre: 'Sucursal Centro', direccion: 'José Azueta 25', capacidad: 100, idCiudad: 1, createdAt: new Date(), updatedAt: new Date()},
      {nombre: 'Sucursal Coatepec', direccion: 'C. Libertad 280', capacidad: 650, idCiudad: 2, createdAt: new Date(), updatedAt: new Date()},
      {nombre: 'Sucursal 5 poniente', direccion: 'Av 5 Pte 139', capacidad: 100, idCiudad: 3, createdAt: new Date(), updatedAt: new Date()},
      {nombre: 'Sucursal Angelópolis', direccion: 'Blvd. América 401', capacidad: 780, idCiudad: 3, createdAt: new Date(), updatedAt: new Date()}
    ])

    await queryInterface.bulkInsert('Vehiculo',[
      {id: crypto.randomUUID(), placa: 'DSA-AD5-C', modelo: 'Fiesta', pasajeros: 5, transmision: 1, tamano: 'B', tipo_combustible: 1, aire_acondicionado: 1, idColor: 10, idMarca: 3, idSucursal: 1, createdAt: new Date(), updatedAt: new Date()},
      {id: crypto.randomUUID(), placa: 'YKM-421-A', modelo: 'Fiesta', pasajeros: 5, transmision: 1, tamano: 'B', tipo_combustible: 1, aire_acondicionado: 1, idColor: 10, idMarca: 3, idSucursal: 1, createdAt: new Date(), updatedAt: new Date()},
      {id: crypto.randomUUID(), placa: 'HGB-902-B', modelo: 'Versa', pasajeros: 5, transmision: 2, tamano: 'B', tipo_combustible: 1, aire_acondicionado: 1, idColor: 1, idMarca: 5, idSucursal: 1, createdAt: new Date(), updatedAt: new Date()},
      {id: crypto.randomUUID(), placa: 'JRT-115-C', modelo: 'Civic', pasajeros: 5, transmision: 2, tamano: 'C', tipo_combustible: 1, aire_acondicionado: 1, idColor: 3, idMarca: 2, idSucursal: 2, createdAt: new Date(), updatedAt: new Date()},
      {id: crypto.randomUUID(), placa: 'LMP-883-D', modelo: 'Sentra', pasajeros: 5, transmision: 1, tamano: 'C', tipo_combustible: 1, aire_acondicionado: 1, idColor: 2, idMarca: 5, idSucursal: 1, createdAt: new Date(), updatedAt: new Date()},
      {id: crypto.randomUUID(), placa: 'KWF-004-E', modelo: 'Corolla', pasajeros: 5, transmision: 2, tamano: 'C', tipo_combustible: 2, aire_acondicionado: 1, idColor: 4, idMarca: 1, idSucursal: 1, createdAt: new Date(), updatedAt: new Date()},
      {id: crypto.randomUUID(), placa: 'TRQ-552-F', modelo: 'Aveo', pasajeros: 5, transmision: 1, tamano: 'B', tipo_combustible: 1, aire_acondicionado: 0, idColor: 6, idMarca: 4, idSucursal: 2, createdAt: new Date(), updatedAt: new Date()},
      {id: crypto.randomUUID(), placa: 'MBN-339-G', modelo: 'Mazda 3', pasajeros: 5, transmision: 2, tamano: 'C', tipo_combustible: 1, aire_acondicionado: 1, idColor: 9, idMarca: 12, idSucursal: 1, createdAt: new Date(), updatedAt: new Date()},
      {id: crypto.randomUUID(), placa: 'VXD-771-H', modelo: 'Jetta', pasajeros: 5, transmision: 2, tamano: 'C', tipo_combustible: 1, aire_acondicionado: 1, idColor: 2, idMarca: 6, idSucursal: 1, createdAt: new Date(), updatedAt: new Date()},
      {id: crypto.randomUUID(), placa: 'ZPA-228-I', modelo: 'Rio', pasajeros: 5, transmision: 1, tamano: 'B', tipo_combustible: 1, aire_acondicionado: 1, idColor: 7, idMarca: 11, idSucursal: 2, createdAt: new Date(), updatedAt: new Date()},
      {id: crypto.randomUUID(), placa: 'QRS-606-J', modelo: 'March', pasajeros: 5, transmision: 1, tamano: 'A', tipo_combustible: 1, aire_acondicionado: 1, idColor: 13, idMarca: 5, idSucursal: 2, createdAt: new Date(), updatedAt: new Date()},

    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Vehiculo', null, {})
    await queryInterface.bulkDelete('Sucursal', null, {})
    await queryInterface.bulkDelete('Marca', null, {})
    await queryInterface.bulkDelete('Color', null, {})

  }
};
