const Service = require("../models/service.model");

// Create service
const createService = async (providerProfileId, data) => {

    const {
        service_name,
        description,
        duration_minutes,
        price
    } = data;

    return await Service.createService(
        providerProfileId,
        service_name,
        description,
        duration_minutes,
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
    getMyServices
};