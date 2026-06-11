let self = {};

self.obtenerTarifasVehiculos = function(tamano) {
    switch (tamano) {
        case 'A':
            return 20.00;
        case 'B':
            return 30.00;
        case 'C':
            return 50.00;
        case 'D':
            return 70.00;
        case 'E':
            return 120.00;
        case 'F':
            return 200.00;
        case 'S':
            return 300.00;
        default:
            return 50.00;
    }
}

module.exports = self;