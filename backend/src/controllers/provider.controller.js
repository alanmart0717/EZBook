const ProviderService = require("../services/provider.service.js");

// Create provider profile
const createProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const profile = await ProviderService.createProviderProfile(
            userId,
            req.body
        );

        res.status(201).json({
            message: "Provider profile created",
            data: profile
        });

    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// Get my profile
const getMyProfile = async (req, res) => {
    try {
        const profile = await ProviderService.getMyProviderProfile(
            req.user.userId
        );

        res.status(200).json({
            data: profile
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

module.exports = {
    createProfile,
    getMyProfile
};