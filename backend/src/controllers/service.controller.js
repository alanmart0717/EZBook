const Provider = require("../models/provider.model");
const ServiceService = require("../services/service.service");

// Get all services
const getAllServices = async (req, res) => {
    try {
        const services = await ServiceService.getAllServices();

        res.status(200).json({
            data: services
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// Create service
const createService = async (req, res) => {
    try {
        const provider = await Provider.getProviderByUserId(req.user.userId);

        if (!provider) {
            return res.status(403).json({
                error: "Provider profile not found. Please create one first."
            });
        }

        const service = await ServiceService.createService(
            provider.provider_profile_id,
            req.body
        );

        res.status(201).json({
            message: "Service created successfully",
            data: service
        });

    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// Delete service
const deleteService = async (req, res) => {
    try {
        const provider = await Provider.getProviderByUserId(req.user.userId);

        if (!provider) {
            return res.status(403).json({
                error: "Provider profile not found."
            });
        }

        const { serviceId } = req.params;

        const deleted = await ServiceService.deleteService(
            serviceId,
            provider.provider_profile_id
        );

        if (!deleted) {
            return res.status(404).json({
                error: "Service not found or you do not own this service."
            });
        }

        res.status(200).json({
            message: "Service deleted successfully",
            data: deleted
        });

    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

module.exports = {
    getAllServices,
    createService,
    deleteService
};