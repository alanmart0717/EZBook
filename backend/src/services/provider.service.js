const Provider = require("../models/provider.model");

const createProviderProfile = async (userId, data) => {
    const {
        businessName,
        bio,
        serviceCategory,
        location
    } = data;

    return await Provider.createProviderProfile(
        userId,
        businessName,
        bio,
        serviceCategory,
        location
    );
};

const getMyProviderProfile = async (userId) => {
    return await Provider.getProviderByUserId(userId);
};

module.exports = {
    createProviderProfile,
    getMyProviderProfile
};