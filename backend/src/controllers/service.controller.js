const Provider = require("../models/provider.model");
const ServiceService = require("../services/service.service");

const createService = async (req, res) => {
    try {
        const provider = await Provider.getProviderByUserId(req.user.userId);

        if (!provider) {
            return res.status(403).json({
                error: "Provider profile not found. Please create one first."
            });
        }

        const service = await ServiceService.createService(
            req.body,
            provider.provider_profile_id
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

module.exports = {
    createService
};