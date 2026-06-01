const { sequelize, Suscripcion, SuscripcionUsuario, Pago, Tarjeta, Usuario } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Consultar catálogo de planes
const obtenerPlanesActivos = async () => {
    return await Suscripcion.findAll({ where: { estado: 0 } }); // 0 es un plan activo
};

// Consultar mi suscripción
const obtenerSuscripcionActivaUsuario = async (idUsuario) => {
    return await SuscripcionUsuario.findOne({
        where: { idUsuario, estado: 0 },
        include: [{ model: Suscripcion }]
    });
};

// Suscribirse (Simulando pago y guardando tarjeta)
const suscribirUsuario = async (idUsuario, datosSuscripcion) => {
    const { idSuscripcion, numeroTarjeta, cvv, titular, fechaVencimiento } = datosSuscripcion;
    
    const t = await sequelize.transaction();

    try {
        const plan = await Suscripcion.findByPk(idSuscripcion);
        if (!plan) throw new Error('El plan seleccionado no existe');

        const nuevaTarjeta = await Tarjeta.create({
            id: uuidv4(),
            numeroTarjeta,
            cvv,
            titular,
            fechaVencimiento,
            idCliente: idUsuario
        }, { transaction: t });

        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setMonth(fechaInicio.getMonth() + 1); 

        const suscripcionUsuario = await SuscripcionUsuario.create({
            idUsuario,
            idSuscripcion: plan.id,
            estado: 0, 
            fechaInicio,
            fechaFin
        }, { transaction: t });

        await Pago.create({
            monto: plan.precio,
            fechaPago: new Date(),
            concepto: `Suscripción mensual: ${plan.nombre}`,
            cvv: cvv, 
            idTarjeta: nuevaTarjeta.id,
            idSuscripcion: suscripcionUsuario.id
        }, { transaction: t });

        await Usuario.update(
            { idSuscripcion: plan.id },
            { where: { id: idUsuario }, transaction: t }
        );

        await t.commit();
        return suscripcionUsuario;

    } catch (error) {
        await t.rollback();
        throw new Error(error.message || 'Error al procesar la suscripción');
    }
};

// Cambiar método de pago
const cambiarMetodoPago = async (idUsuario, datosTarjeta) => {
    const { numeroTarjeta, cvv, titular, fechaVencimiento } = datosTarjeta;
    
    const nuevaTarjeta = await Tarjeta.create({
        id: uuidv4(),
        numeroTarjeta,
        cvv,
        titular,
        fechaVencimiento,
        idCliente: idUsuario
    });

    return nuevaTarjeta;
};

// Cancelar Suscripción
const cancelarSuscripcion = async (idUsuario) => {
    const suscripcion = await SuscripcionUsuario.findOne({ where: { idUsuario, estado: 0 } });
    if (!suscripcion) throw new Error('No tienes una suscripción activa para cancelar');

    // estado a 1 (Cancelada / Inactiva)
    suscripcion.estado = 1; 
    await suscripcion.save();

    await Usuario.update({ idSuscripcion: null }, { where: { id: idUsuario } });

    return suscripcion;
};

// Cambiar de Plan 
const cambiarPlan = async (idUsuario, datosCambio) => {
    const { nuevoIdSuscripcion, idTarjetaExistente, cvv } = datosCambio;
    const t = await sequelize.transaction();

    try {
        await SuscripcionUsuario.update(
            { estado: 1 }, 
            { where: { idUsuario, estado: 0 }, transaction: t }
        );

        const nuevoPlan = await Suscripcion.findByPk(nuevoIdSuscripcion);
        if (!nuevoPlan) throw new Error('El nuevo plan no existe');

        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setMonth(fechaInicio.getMonth() + 1);

        const nuevaSuscripcion = await SuscripcionUsuario.create({
            idUsuario,
            idSuscripcion: nuevoPlan.id,
            estado: 0, // 0 es activo
            fechaInicio,
            fechaFin
        }, { transaction: t });

        await Pago.create({
            monto: nuevoPlan.precio,
            fechaPago: new Date(),
            concepto: `Cambio de plan a ${nuevoPlan.nombre}`,
            cvv: cvv,
            idTarjeta: idTarjetaExistente, 
            idSuscripcion: nuevaSuscripcion.id
        }, { transaction: t });

        await Usuario.update(
            { idSuscripcion: nuevoPlan.id },
            { where: { id: idUsuario }, transaction: t }
        );

        await t.commit();
        return nuevaSuscripcion;

    } catch (error) {
        await t.rollback();
        throw new Error(error.message || 'Error al cambiar de plan');
    }
};

module.exports = {
    obtenerPlanesActivos,
    obtenerSuscripcionActivaUsuario,
    suscribirUsuario,
    cambiarMetodoPago,
    cancelarSuscripcion,
    cambiarPlan
};