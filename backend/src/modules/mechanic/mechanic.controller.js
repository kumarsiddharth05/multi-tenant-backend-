const mechanicService = require('./mechanic.service');

const create = async (tenantId, body) => {
    const { customerName, customerPhone, vehicleDetails, problemDescription } = body;
    if (!customerName || !customerPhone || !vehicleDetails || !problemDescription) {
        const error = new Error('Missing required fields: customerName, customerPhone, vehicleDetails, problemDescription');
        error.statusCode = 400;
        throw error;
    }
    return await mechanicService.createMechanicJob(tenantId, body);
};

const updateStatus = async (tenantId, id, status) => {
    return await mechanicService.updateMechanicJobStatus(tenantId, id, status);
};

const getAll = async (tenantId) => {
    return await mechanicService.getMechanicJobs(tenantId);
};

module.exports = {
    create,
    updateStatus,
    getAll
};
