let pagosServicio = {};

pagosServicio.calcularRecargoPorTiempo = function(fechaLimite, fechaActual, tarifaPorHora) {
    if (fechaActual <= fechaLimite) {
        return { aplicaCargo: false, horasExtra: 0, montoRecargo: 0};
    }

    const diferenciaMilisegundos = Math.abs(fechaActual - fechaLimite);
    const horasExtra = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60));

    return {
        aplicaRecargo: true,
        horasExtra: horasExtra,
        montoRecargo: horasExtra * tarifaPorHora
    };
};

pagosServicio.generarRecibo = function(montoBase, recargos, concepto) {
    const subtotal = montoBase + recargos;
    const IVA = subtotal * 0.16;

    return {
        concepto: concepto,
        montoBase: montoBase,
        recargos: recargos, 
        subtotal: subtotal,
        impuesto: IVA,
        totalAPagar: subtotal + IVA,
        fechaEmision: new Date()
    };
};

module.exports = pagosServicio;