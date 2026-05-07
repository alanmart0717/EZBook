const Service = require("../models/service.model");
const Appointment = require("../models/appointment.model");

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

// Delete service
const deleteService = async (serviceId, providerProfileId) => {
    const deletedService = await Service.deleteService(serviceId, providerProfileId);

    if (!deletedService) {
        throw new Error("Service not found or unauthorized");
    }

    await Appointment.cancelFutureAppointmentsByService(serviceId);

    return deletedService;
};

module.exports = {
    createService,
    getAllServices,
    getMyServices,
    deleteService
};