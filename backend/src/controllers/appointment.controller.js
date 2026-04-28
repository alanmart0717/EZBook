const AppointmentService = require("../services/appointment.service");

// Customer creates appointment
const createAppointment = async (req, res) => {
    try {
        const customerId = req.user.userId;

        const appointment = await AppointmentService.createAppointment(
            customerId,
            req.body
        );

        res.status(201).json({
            message: "Appointment created successfully",
            data: appointment
        });

    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// Provider gets their appointments
const getMyProviderAppointments = async (req, res) => {
    try {
        const Provider = require("../models/provider.model");

        const provider = await Provider.getProviderByUserId(req.user.userId);

        if (!provider) {
            return res.status(403).json({
                error: "Provider profile not found"
            });
        }

        const appointments = await AppointmentService.getProviderAppointments(
            provider.provider_profile_id
        );

        res.status(200).json({
            data: appointments
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

module.exports = {
    createAppointment,
    getMyProviderAppointments
};