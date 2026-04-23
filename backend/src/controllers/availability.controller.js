const Provider = require("../models/provider.model");
const AvailabilityService = require("../services/availability.service");

// Add availability (provider only)
const addAvailability = async (req, res) => {
    try {
        const provider = await Provider.getProviderByUserId(req.user.userId);

        if (!provider) {
            return res.status(403).json({
                error: "Provider profile not found"
            });
        }

        const slot = await AvailabilityService.addAvailability(
            provider.provider_profile_id,
            req.body
        );

        res.status(201).json({
            message: "Availability added successfully",
            data: slot
        });

    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// Get my availability
const getMyAvailability = async (req, res) => {
    try {
        const provider = await Provider.getProviderByUserId(req.user.userId);

        const slots = await AvailabilityService.getMyAvailability(
            provider.provider_profile_id
        );

        res.status(200).json({
            data: slots
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// Delete availability slot
const deleteAvailability = async (req, res) => {
    try {
        const { availabilityId } = req.params;

        const deleted = await AvailabilityService.removeAvailability(
            availabilityId
        );

        res.status(200).json({
            message: "Availability deleted",
            data: deleted
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

module.exports = {
    addAvailability,
    getMyAvailability,
    deleteAvailability
};