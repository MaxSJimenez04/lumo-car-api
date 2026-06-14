const { sequelize, Suscripcion, SuscripcionUsuario, Pago, Tarjeta, Usuario, Notificacion } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Función ayudante para traducir "LuciaLopez1986" a su UUID real
const obtenerIdReal = async (nombreUsuario) => {
    const usuario = await Usuario.findOne({ where: { usuario: nombreUsuario } });
    if (!usuario) throw new Error('Usuario no encontrado en la base de datos');
    return usuario.id;
};

// Consultar catálogo de planes
const obtenerPlanesActivos = async () => {
    return await Suscripcion.findAll({ where: { estado: 0 } }); 
};

// Consultar mi suscripción
const obtenerSuscripcionActivaUsuario = async (nombreUsuario) => {
    const idReal = await obtenerIdReal(nombreUsuario);
    return await SuscripcionUsuario.findOne({
        where: { idUsuario: idReal, estado: 0 },
        include: [{ model: Suscripcion }]
    });
};

// Suscribirse 
const suscribirUsuario = async (nombreUsuario, datosSuscripcion) => {
    const { idSuscripcion, numeroTarjeta, cvv, titular, fechaVencimiento } = datosSuscripcion;
    
    const t = await sequelize.transaction();

    try {
        const usuarioBD = await Usuario.findOne({ where: { usuario: nombreUsuario } });
        if (!usuarioBD) throw new Error('Usuario no encontrado');
        const idReal = usuarioBD.id;

        const plan = await Suscripcion.findByPk(idSuscripcion);
        if (!plan) throw new Error('El plan seleccionado no existe');

        const nuevaTarjeta = await Tarjeta.create({
            id: uuidv4(), 
            numeroTarjeta,
            cvv,
            titular,
            fechaVencimiento,
            idCliente: idReal 
        }, { transaction: t });

        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setMonth(fechaInicio.getMonth() + 1); 

        const suscripcionUsuario = await SuscripcionUsuario.create({
            id: Math.floor(Math.random() * 100000000), 
            idUsuario: idReal, 
            idSuscripcion: plan.id,
            estado: 0, 
            fechaInicio,
            fechaFin
        }, { transaction: t });

        await Pago.create({
            id: Math.floor(Math.random() * 100000000), 
            monto: plan.precio,
            fechaPago: new Date(),
            concepto: `Suscripción mensual: ${plan.nombre}`,
            cvv: cvv, 
            idTarjeta: nuevaTarjeta.id,
            idSuscripcion: suscripcionUsuario.id
        }, { transaction: t });

        await Usuario.update(
            { idSuscripcion: plan.id },
            { where: { id: idReal }, transaction: t } 
        );

        const notificacion = await Notificacion.create({
            idUsuario: idReal,
            idSuscripcionUsuario: suscripcionUsuario.id,
            titulo: 'Suscripción activada',
            mensaje: `Tu suscripción al plan "${plan.nombre}" ha sido activada exitosamente.`,
            tipo: 'SUSCRIPCION_CREADA',
            leida: false,
            fecha_envio: new Date()
        }, { transaction: t });

        await t.commit();
        return { suscripcion: suscripcionUsuario, notificacion };

    } catch (error) {
        await t.rollback();
        throw new Error(error.original ? error.original.message : error.message);
    }
};

// Cambiar método de pago
const cambiarMetodoPago = async (nombreUsuario, datosTarjeta) => {
    const idReal = await obtenerIdReal(nombreUsuario);
    const { numeroTarjeta, cvv, titular, fechaVencimiento } = datosTarjeta;
    
    const nuevaTarjeta = await Tarjeta.create({
        id: uuidv4(),
        numeroTarjeta,
        cvv,
        titular,
        fechaVencimiento,
        idCliente: idReal 
    });

    return nuevaTarjeta;
};

// Cancelar Suscripción
const cancelarSuscripcion = async (nombreUsuario) => {
    const t = await sequelize.transaction();
    try {
        const idReal = await obtenerIdReal(nombreUsuario);
        const suscripcion = await SuscripcionUsuario.findOne({ where: { idUsuario: idReal, estado: 0 }, transaction: t });
        if (!suscripcion) throw new Error('No tienes una suscripción activa para cancelar');

        suscripcion.estado = 1;
        await suscripcion.save({ transaction: t });
        await Usuario.update({ idSuscripcion: null }, { where: { id: idReal }, transaction: t });

        const notificacion = await Notificacion.create({
            idUsuario: idReal,
            idSuscripcionUsuario: suscripcion.id,
            titulo: 'Suscripción cancelada',
            mensaje: 'Tu suscripción ha sido cancelada. Puedes volver a suscribirte cuando quieras.',
            tipo: 'SUSCRIPCION_CANCEL',
            leida: false,
            fecha_envio: new Date()
        }, { transaction: t });

        await t.commit();
        return { suscripcion, notificacion };
    } catch (error) {
        await t.rollback();
        throw new Error(error.original ? error.original.message : error.message);
    }
};

// Cambiar de Plan 
const cambiarPlan = async (nombreUsuario, datosCambio) => {
    const { nuevoIdSuscripcion, idTarjetaExistente, cvv } = datosCambio;
    const t = await sequelize.transaction();

    try {
        const usuarioBD = await Usuario.findOne({ where: { usuario: nombreUsuario } });
        if (!usuarioBD) throw new Error('Usuario no encontrado');
        const idReal = usuarioBD.id;

        await SuscripcionUsuario.update(
            { estado: 1 }, 
            { where: { idUsuario: idReal, estado: 0 }, transaction: t }
        );

        const nuevoPlan = await Suscripcion.findByPk(nuevoIdSuscripcion);
        if (!nuevoPlan) throw new Error('El nuevo plan no existe');

        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setMonth(fechaInicio.getMonth() + 1);

        const nuevaSuscripcion = await SuscripcionUsuario.create({
            id: Math.floor(Math.random() * 100000000), 
            idUsuario: idReal, 
            idSuscripcion: nuevoPlan.id,
            estado: 0, 
            fechaInicio,
            fechaFin
        }, { transaction: t });

        await Pago.create({
            id: Math.floor(Math.random() * 100000000), 
            monto: nuevoPlan.precio,
            fechaPago: new Date(),
            concepto: `Cambio de plan a ${nuevoPlan.nombre}`,
            cvv: cvv,
            idTarjeta: idTarjetaExistente, 
            idSuscripcion: nuevaSuscripcion.id
        }, { transaction: t });

        await Usuario.update(
            { idSuscripcion: nuevoPlan.id },
            { where: { id: idReal }, transaction: t } 
        );

        const notificacion = await Notificacion.create({
            idUsuario: idReal,
            idSuscripcionUsuario: nuevaSuscripcion.id,
            titulo: 'Plan actualizado',
            mensaje: `Tu plan ha sido cambiado a "${nuevoPlan.nombre}" exitosamente.`,
            tipo: 'SUSCRIPCION_CAMBIO',
            leida: false,
            fecha_envio: new Date()
        }, { transaction: t });

        await t.commit();
        return { suscripcion: nuevaSuscripcion, notificacion };

    } catch (error) {
        await t.rollback();
        throw new Error(error.original ? error.original.message : error.message);
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