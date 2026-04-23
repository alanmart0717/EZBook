const Service = require("../models/service.model");

// Create service
const createService = async (DataTransfer, providerProfileId) => {
    const {
        serviceName,
        description,
        durationMinutes,
        price
    } = data;

    return await Service.createService(
        providerProfileId,
        serviceName,
        description,
        durationMinutes,
        price
    );
};

// Get all services
const getAllServices = async () => {
    return await Service.getAllServices();
};

// Provider's services
const getMyServices = async (providerProfileId) => {
    return await Service.getServicesByProvider(providerProfileId);
};

module.exports = {
    createService,
    getAllServices,
    getMyServices,
}