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

module.exports = {
    createAppointment
};