const Appointment = require("../models/appointment.model");
const Service = require("../models/service.model");
const Availability = require("../models/availability.model");

const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
};

// Create appointment
const createAppointment = async (userId, data) => {

    const {
        provider_profile_id,
        service_id,
        appointment_date,
        start_time
    } = data;

    // Validate required fields
    if (!provider_profile_id || !service_id || !appointment_date || !start_time) {
        throw new Error("Missing required booking fields");
    }

    // Get service details (for duration calculation)
    const service = await Service.getServiceById(service_id);

    if (!service) {
        throw new Error("Service not found");
    }

    // Calculate end time based on duration
    const durationMinutes = service.duration_minutes;

    const start = new Date(`1970-01-01T${start_time}Z`);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    const end_time = end.toISOString().substring(11, 19);

    // Check provider availability
    const isAvailable = await Availability.checkAvailability(
        provider_profile_id,
        appointment_date,
        start_time,
        end_time
    );

    if (!isAvailable) {
        throw new Error("Provider not available at this time");
    }

    // Check for overlapping appointments
    const hasConflict = await Appointment.checkAppointmentConflict(
        provider_profile_id,
        appointment_date,
        start_time,
        end_time
    );

    if (hasConflict) {
        throw new Error("Time slot already booked");
    }


    // Create appointment
    const appointment = await Appointment.createAppointment(
        userId,
        provider_profile_id,
        service_id,
        appointment_date,
        start_time,
        end_time,
        data.notes || "Booked from EZBook"
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

const getAvailableTimes = async (providerProfileId, serviceId, appointmentDate) => {
    const service = await Service.getServiceById(serviceId);

    if (!service) {
        throw new Error("Service not found");
    }

    const durationMinutes = service.duration_minutes;

    const availabilitySlots = await Availability.getAvailabilityByDate(
        providerProfileId,
        appointmentDate
    );

    const bookedAppointments = await Appointment.getBookedAppointmentsByDate(
        providerProfileId,
        appointmentDate
    );

    const availableTimes = [];

    availabilitySlots.forEach((slot) => {
        let currentTime = timeToMinutes(slot.start_time);
        const endTime = timeToMinutes(slot.end_time);

        while (currentTime + durationMinutes <= endTime) {
            const potentialStart = minutesToTime(currentTime);
            const potentialEnd = minutesToTime(currentTime + durationMinutes);

            const hasConflict = bookedAppointments.some((appointment) => {
                return (
                    potentialStart < appointment.end_time.slice(0, 5) &&
                    potentialEnd > appointment.start_time.slice(0, 5)
                );
            });

            if (!hasConflict) {
                availableTimes.push(potentialStart);
            }

            currentTime += 30;
        }
    });

    return availableTimes;
};

module.exports = {
    createAppointment,
    getUserAppointments,
    getProviderAppointments,
    getAvailableTimes
};