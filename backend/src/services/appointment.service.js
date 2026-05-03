const Appointment = require("../models/appointment.model");
const Service = require("../models/service.model");
const Availability = require("../models/availability.model");

// Convert time string into total minutes
const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

// Convert total minutes back into HH:MM:SS format
const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
};

// Normalize time so backend always compares HH:MM:SS
const normalizeTime = (time) => {
    if (!time) return time;
    return time.length === 5 ? `${time}:00` : time;
};

// Create appointment
const createAppointment = async (userId, data) => {

    const {
        provider_profile_id,
        service_id,
        appointment_date,
        start_time,
        notes
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

    // Normalize start time and calculate end time
    const normalizedStartTime = normalizeTime(start_time);
    const durationMinutes = service.duration_minutes;

    const startMinutes = timeToMinutes(normalizedStartTime);
    const end_time = minutesToTime(startMinutes + durationMinutes);

    // Check provider availability
    const isAvailable = await Availability.checkAvailability(
        provider_profile_id,
        appointment_date,
        normalizedStartTime,
        end_time
    );

    if (!isAvailable) {
        throw new Error("Provider not available at this time");
    }

    // Check for overlapping appointments
    const hasConflict = await Appointment.checkAppointmentConflict(
        provider_profile_id,
        appointment_date,
        normalizedStartTime,
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
        normalizedStartTime,
        end_time,
        notes || "Booked from EZBook"
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

// Generate available times for a provider on a specific date
const getAvailableTimes = async (providerProfileId, serviceId, appointmentDate) => {
    // Get service details (for duration calculation)
    const service = await Service.getServiceById(serviceId);

    if (!service) {
        throw new Error("Service not found");
    }

    const durationMinutes = service.duration_minutes;

    // Get provider availability for selected date
    const availabilitySlots = await Availability.getAvailabilityByDate(
        providerProfileId,
        appointmentDate
    );

    // Get booked appointments for selected date
    const bookedAppointments = await Appointment.getBookedAppointmentsByDate(
        providerProfileId,
        appointmentDate
    );

    console.log("AVAILABILITY SLOTS:", availabilitySlots);
    console.log("BOOKED APPOINTMENTS:", bookedAppointments);

    const availableTimes = [];

    availabilitySlots.forEach((slot) => {
        let currentTime = timeToMinutes(normalizeTime(slot.start_time));
        const endTime = timeToMinutes(normalizeTime(slot.end_time));

        // Generate 30-minute time slots inside availability range
        while (currentTime + durationMinutes <= endTime) {
            const potentialStart = minutesToTime(currentTime);
            const potentialEnd = minutesToTime(currentTime + durationMinutes);

            // Check if generated time conflicts with booked appointments
            const hasConflict = bookedAppointments.some((appointment) => {
                const bookedStart = normalizeTime(appointment.start_time).slice(0, 5);
                const bookedEnd = normalizeTime(appointment.end_time).slice(0, 5);

                return (
                    potentialStart.slice(0, 5) < bookedEnd &&
                    potentialEnd.slice(0, 5) > bookedStart
                );
            });

            // Add time if no conflict exists
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