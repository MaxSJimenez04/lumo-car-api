const cron = require('node-cron');
const { Renta, sequelize } = require('../models');
const { Op } = require('sequelize');

function iniciarScheduler() {
    cron.schedule('* * * * *', async () => {
        try {
            const [actualizadas] = await Renta.update(
                { estadoRenta: 1 },
                {
                    where: {
                        estadoRenta: 0,
                        fechaInicio: { [Op.lte]: new Date() }
                    }
                }
            );

            if (actualizadas > 0) {
                console.log(`[Scheduler] ${actualizadas} renta(s) iniciada(s).`);
            }
        } catch (error) {
            console.error('[Scheduler] Error al actualizar estados de rentas:', error);
        }
    });

    console.log('[Scheduler] Monitoreo de rentas activo.');
}

module.exports = { iniciarScheduler };
