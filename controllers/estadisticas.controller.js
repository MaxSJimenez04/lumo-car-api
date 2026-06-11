const { Renta, Pago, Vehiculo, Sucursal, Marca, Usuario, Rol, SuscripcionUsuario, Suscripcion } = require('../models');
const { fn, col, literal, Op } = require('sequelize');

let self = {};

const MSG_SIN_REGISTROS = 'No se tienen registros para hacer estadísticas.';

self.estadisticasRentas = async function (req, res, next) {
    try {
        const [porSucursal, porVehiculo] = await Promise.all([
            Renta.findAll({
                attributes: [
                    [fn('COUNT', col('Renta.id')), 'totalRentas']
                ],
                include: [{
                    model: Vehiculo,
                    attributes: [],
                    required: true,
                    include: [{
                        model: Sucursal,
                        attributes: ['id', 'nombre', 'direccion'],
                        required: true
                    }]
                }],
                group: [
                    col('Vehiculo->Sucursal.id'),
                    col('Vehiculo->Sucursal.nombre'),
                    col('Vehiculo->Sucursal.direccion')
                ],
                order: [[literal('totalRentas'), 'DESC']],
                subQuery: false,
                raw: true,
                nest: true
            }),
            Renta.findAll({
                attributes: [
                    [fn('COUNT', col('Renta.id')), 'totalRentas']
                ],
                include: [{
                    model: Vehiculo,
                    attributes: ['modelo', 'placa'],
                    required: true,
                    include: [{ model: Marca, attributes: ['nombreMarca'], required: true }]
                }],
                group: [
                    col('Vehiculo.modelo'),
                    col('Vehiculo.placa'),
                    col('Vehiculo->Marca.id'),
                    col('Vehiculo->Marca.nombreMarca')
                ],
                order: [[literal('totalRentas'), 'DESC']],
                subQuery: false,
                raw: true,
                nest: true
            })
        ]);

        if (porSucursal.length === 0 && porVehiculo.length === 0) {
            return res.status(200).json({ mensaje: MSG_SIN_REGISTROS, datos: null });
        }

        return res.status(200).json({ porSucursal, porVehiculo });
    } catch (error) {
        next(error);
    }
};

self.estadisticasSuscripciones = async function (req, res, next) {
    try {
        const porMes = await SuscripcionUsuario.findAll({
            attributes: [
                [literal("CONVERT(varchar(7), [SuscripcionUsuario].[fechaInicio], 120)"), 'mes'],
                [fn('COUNT', col('SuscripcionUsuario.id')), 'total'],
                [fn('SUM', col('Suscripcion.precio')), 'ingresos']
            ],
            include: [{
                model: Suscripcion,
                attributes: [],
                required: true
            }],
            group: [literal("CONVERT(varchar(7), [SuscripcionUsuario].[fechaInicio], 120)")],
            order: [[literal('mes'), 'ASC']],
            subQuery: false,
            raw: true
        });

        if (porMes.length === 0) {
            return res.status(200).json({ mensaje: MSG_SIN_REGISTROS, datos: null });
        }

        const totalSuscripciones = porMes.reduce((sum, row) => sum + parseInt(row.total), 0);
        const totalIngresos = porMes.reduce((sum, row) => sum + parseFloat(row.ingresos), 0);

        return res.status(200).json({ porMes, totalSuscripciones, totalIngresos });
    } catch (error) {
        next(error);
    }
};

self.estadisticasUsuarios = async function (req, res, next) {
    try {
        const totalClientes = await Usuario.count({
            include: [{
                model: Rol,
                where: { nombreRol: 'Cliente' },
                required: true,
                attributes: []
            }]
        });

        return res.status(200).json({ totalClientes });
    } catch (error) {
        next(error);
    }
};

self.estadisticasUsoVehiculos = async function (req, res, next) {
    try {
        const resultados = await Renta.findAll({
            where: { estadoRenta: [2, 4] },
            attributes: [
                [fn('COUNT', col('Renta.id')), 'totalUsos'],
                [fn('SUM', fn('DATEDIFF', literal('HOUR'), col('Renta.fechaInicio'), col('Renta.fechaFin'))), 'totalHoras']
            ],
            include: [{
                model: Vehiculo,
                attributes: ['modelo'],
                required: true,
                include: [
                    { model: Sucursal, attributes: ['id', 'nombre', 'direccion'], required: true },
                    { model: Marca, attributes: ['nombreMarca'], required: true }
                ]
            }],
            group: [
                col('Vehiculo.modelo'),
                col('Vehiculo->Sucursal.id'),
                col('Vehiculo->Sucursal.nombre'),
                col('Vehiculo->Sucursal.direccion'),
                col('Vehiculo->Marca.id'),
                col('Vehiculo->Marca.nombreMarca')
            ],
            order: [
                [col('Vehiculo->Sucursal.nombre'), 'ASC'],
                [literal('totalUsos'), 'DESC']
            ],
            subQuery: false,
            raw: true,
            nest: true
        });

        if (resultados.length === 0) {
            return res.status(200).json({ mensaje: MSG_SIN_REGISTROS, datos: null });
        }

        const mapasSucursal = {};
        resultados.forEach(r => {
            const sucursal = r.Vehiculo.Sucursal;
            if (!mapasSucursal[sucursal.id]) {
                mapasSucursal[sucursal.id] = {
                    sucursal: { id: sucursal.id, nombre: sucursal.nombre, direccion: sucursal.direccion },
                    vehiculos: []
                };
            }
            mapasSucursal[sucursal.id].vehiculos.push({
                marca: r.Vehiculo.Marca.nombreMarca,
                modelo: r.Vehiculo.modelo,
                totalUsos: parseInt(r.totalUsos),
                totalHoras: parseInt(r.totalHoras) || 0
            });
        });

        return res.status(200).json({ sucursales: Object.values(mapasSucursal) });
    } catch (error) {
        next(error);
    }
};

self.estadisticasIngresos = async function (req, res, next) {
    try {
        const mesSql = "CONVERT(varchar(7), [Pago].[fechaPago], 120)";

        const [porMesRentas, porMesSuscripciones] = await Promise.all([
            Pago.findAll({
                where: { idRenta: { [Op.ne]: null } },
                attributes: [
                    [literal(mesSql), 'mes'],
                    [fn('SUM', col('Pago.monto')), 'ingresos'],
                    [fn('COUNT', col('Pago.idPago')), 'numeroPagos']
                ],
                group: [literal(mesSql)],
                order: [[literal('mes'), 'ASC']],
                raw: true
            }),
            Pago.findAll({
                where: { idSuscripcion: { [Op.ne]: null } },
                attributes: [
                    [literal(mesSql), 'mes'],
                    [fn('SUM', col('Pago.monto')), 'ingresos'],
                    [fn('COUNT', col('Pago.idPago')), 'numeroPagos']
                ],
                group: [literal(mesSql)],
                order: [[literal('mes'), 'ASC']],
                raw: true
            })
        ]);

        const totalRentas = porMesRentas.reduce((sum, row) => sum + parseFloat(row.ingresos), 0);
        const totalSuscripciones = porMesSuscripciones.reduce((sum, row) => sum + parseFloat(row.ingresos), 0);

        return res.status(200).json({
            rentas: { porMes: porMesRentas, total: totalRentas },
            suscripciones: { porMes: porMesSuscripciones, total: totalSuscripciones },
            totalGeneral: totalRentas + totalSuscripciones
        });
    } catch (error) {
        next(error);
    }
};

module.exports = self;
