const AppointmentService = require("../services/appointment.service");
const Appointment = require("../models/appointment.model");
const Provider = require("../models/provider.model");
const Notification = require("../models/notification.model");


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

// Customers get their appointments
const getMyCustomerAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.getAppointmentsByCustomer(
      req.user.userId
    );

    res.json({ data: appointments });
  } catch (err) {
    console.error("GET CUSTOMER APPOINTMENTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const getMyProviderAppointmentHistory = async (req, res) => {
  try {
    const provider = await Provider.getProviderByUserId(req.user.userId);

    if (!provider) {
      return res.status(403).json({
        error: "Provider profile not found"
      });
    }

    console.log("HISTORY PROVIDER PROFILE ID:", provider.provider_profile_id);

    const history = await Appointment.getProviderAppointmentHistory(
      provider.provider_profile_id
    );

    res.status(200).json({
      message: "Provider appointment history retrieved successfully",
      data: history,
    });

  } catch (error) {
    console.error("Error getting provider appointment history:", error);
    res.status(500).json({ error: error.message });
  }
};

const acceptAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.getAppointmentById(appointmentId);

    //security check (provider owns it)
    const providerProfile = await Provider.getProviderByUserId(req.user.userId);

    if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
    }

    if (String(appointment.provider_profile_id) !== String(providerProfile.provider_profile_id)) {
        return res.status(403).json({ error: "Not authorized" });
    }

    const dateOnly = String(appointment.appointment_date).split("T")[0];
    const cleanStartTime = String(appointment.start_time).split("-")[0];

    const appointmentDateTime = new Date(`${dateOnly}T${cleanStartTime}`);
    const now = new Date();

    if (appointmentDateTime < now) {
      return res.status(400).json({
        error: "Cannot accept an appointment that has already passed"
      });
    }

    const updated = await Appointment.updateAppointmentStatus(appointmentId, "confirmed");

   await Notification.createNotification(
      appointment.customer_id,
      appointmentId,
      "Appointment Accepted",
      `Your ${appointment.service_name} appointment with ${appointment.business_name || "your provider"} was accepted.`
    );

    res.json({ message: "Appointment accepted", data: updated });

  } catch (err) {
    console.error("ACCEPT APPOINTMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const declineAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.getAppointmentById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const providerProfile = await Provider.getProviderByUserId(req.user.userId);

    if (String(appointment.provider_profile_id) !== String(providerProfile.provider_profile_id)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updated = await Appointment.updateAppointmentStatus(appointmentId, "cancelled");

    await Notification.createNotification(
      appointment.customer_id,
      appointmentId,
      "Appointment Declined",
      `Your ${appointment.service_name} appointment with ${appointment.business_name || "your provider"} was declined.`
    );

    res.json({ message: "Appointment declined", data: updated });

  } catch (err) {
    console.error("DECLINE APPOINTMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.getAppointmentById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // only owner can cancel
    if (String(appointment.customer_id) !== String(req.user.userId)) {
        return res.status(403).json({ error: "Not authorized" });
    }

    const appointmentDateTime = new Date(
      `${appointment.appointment_date}T${appointment.start_time}`
    );

    const now = new Date();
    const hours = (appointmentDateTime - now) / (1000 * 60 * 60);

    if (hours < 8) {
      return res.status(400).json({
        error: "Must cancel at least 8 hours before appointment",
      });
    }

    const updated = await Appointment.updateAppointmentStatus(
      appointmentId,
      "cancelled"
    );

    res.json({ message: "Cancelled", data: updated });

  } catch (err) {
    res.status(500).json({ error: "Cancel failed" });
  }
};

const getAvailableTimes = async (req, res) => {
  try {
    const { providerProfileId, serviceId, appointmentDate } = req.query;

    if (!providerProfileId || !serviceId || !appointmentDate) {
      return res.status(400).json({
        error: "providerProfileId, serviceId, and appointmentDate are required"
      });
    }

    const times = await Appointment.getAvailableTimes(
      providerProfileId,
      serviceId,
      appointmentDate
    );

    res.status(200).json({
      data: times
    });

  } catch (err) {
    console.error("GET AVAILABLE TIMES ERROR:", err);
    res.status(500).json({
      error: err.message
    });
  }
};

module.exports = {
    createAppointment,
    getMyProviderAppointments,
    getMyCustomerAppointments,
    getMyProviderAppointmentHistory,
    acceptAppointment,
    declineAppointment,
    cancelAppointment,
    getAvailableTimes
};