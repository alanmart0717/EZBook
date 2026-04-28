const Appointment = require("../models/appointment.model");
const Service = require("../models/service.model");
const Availability = require("../models/availability.model");

// Create appointment
const createAppointment = async (userId, data) => {

    const {
        provider_profile_id,
        service_id,
        appointment_date,
        start_time
    } = data;

    // 1. Validate required fields
    if (!provider_profile_id || !service_id || !appointment_date || !start_time) {
        throw new Error("Missing required booking fields");
    }

    // 2. Get service details (for duration calculation)
    const service = await Service.getServiceById(service_id);

    if (!service) {
        throw new Error("Service not found");
    }

    // 3. Calculate end time based on duration
    const durationMinutes = service.duration_minutes;

    const start = new Date(`1970-01-01T${start_time}Z`);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    const end_time = end.toISOString().substring(11, 19);

    // 4. Check provider availability
    const isAvailable = await Availability.checkAvailability(
        provider_profile_id,
        appointment_date,
        start_time,
        end_time
    );

    if (!isAvailable) {
        throw new Error("Provider not available at this time");
    }

    // 5. Create appointment
    const appointment = await Appointment.createAppointment(
        userId,
        provider_profile_id,
        service_id,
        appointment_date,
        start_time,
        end_time,
        "confirmed"
    );

    return appointment;
};

// Get user appointments
const getUserAppointments = async (userId) => {
    return await Appointment.getAppointmentsByCustomer(userId);
};

// Get provider appointments
const getProviderAppointments = async (providerProfileId) => {
    return await Appointment.getAppointmentsByProvider(providerProfileId);
};

module.exports = {
    createAppointment,
    getUserAppointments,
    getProviderAppointments
};