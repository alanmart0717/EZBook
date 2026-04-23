const Availability = require("../models/availability.model");

// Add availability slot
const addAvailability = async (providerProfileId, data) => {
    const {
        day,
        startTime,
        endTime,
        isAvailable
    } = data;

    return await Availability.createAvailability(
        providerProfileId,
        day,
        startTime,
        endTime,
        isAvailable
    );
};

// Get provider schedule
const getMyAvailability = async (providerProfileId) => {
    return await Availability.getAvailabilityByProviderId(providerProfileId);
};

// Delete slot
const removeAvailability = async (availabilityId) => {
    return await Availability.deleteAvailability(availabilityId);
};

module.exports = {
    addAvailability,
    getMyAvailability,
    removeAvailability
};