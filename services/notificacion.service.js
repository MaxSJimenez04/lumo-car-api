let clientesConectados = new Map();

let self = {};

self.suscribirNotificacionUsuario = function (req, res) {
    const { idUsuario } = req.params;

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    clientesConectados.set(idUsuario, res);

    req.on('close', () => {
        console.log(`Usuario ${idUsuario} se desconectó de SSE`);
        clientesConectados.delete(idUsuario);
    });
};

self.enviarNotificacion = function (idUsuario, payload) {
    const conexionDelCliente = clientesConectados.get(idUsuario);

    if (conexionDelCliente) {
        conexionDelCliente.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
};

module.exports = self;