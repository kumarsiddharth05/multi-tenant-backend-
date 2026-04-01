const restaurantService = require('./restaurant.service');

const create = async (tenantId, body) => {
    const { tableNumber, customerName, items } = body;
    if (!tableNumber || !customerName) {
        const error = new Error('Missing required fields: tableNumber, customerName');
        error.statusCode = 400;
        throw error;
    }
    return await restaurantService.createRestaurantOrder(tenantId, body);
};

const updateStatus = async (tenantId, id, status) => {
    return await restaurantService.updateRestaurantOrderStatus(tenantId, id, status);
};

const getAll = async (tenantId) => {
    return await restaurantService.getRestaurantOrders(tenantId);
};

module.exports = {
    create,
    updateStatus,
    getAll
};
