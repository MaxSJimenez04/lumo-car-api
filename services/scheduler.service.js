const cron = require('node-cron');
const { Renta, sequelize } = require('../models');
const { Op } = require('sequelize');

function iniciarScheduler() {
    cron.schedule('* * * * *', async () => {
        try {
            const ahora = new Date();

            const [iniciadas] = await Renta.update(
                { estadoRenta: 1 },
                {
                    where: {
                        estadoRenta: 0,
                        fechaInicio: { [Op.lte]: ahora }
                    }
                }
            );

            const [finalizada] = await Renta.update(
                { estadoRenta: 2 },
                {
                    where: {
                        estadoRenta: 1,
                        fechaFin: { [Op.lte]: ahora }
                    }
                }
            );

            if (iniciadas > 0) console.log(`[Scheduler] ${iniciadas} renta(s) iniciada(s).`);
            if (finalizada > 0)  console.log(`[Scheduler] ${finalizada} renta(s) marcada(s) como vencidas.`);

        } catch (error) {
            console.error('[Scheduler] Error al actualizar estados de rentas:', error);
        }
    });

    console.log('[Scheduler] Monitoreo de rentas activo.');
}

module.exports = { iniciarScheduler };
