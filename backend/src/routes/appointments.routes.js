const express = require("express");
const router = express.Router();

const AppointmentController = require("../controllers/appointment.controller");
const AppointmentService = require("../services/appointment.service");

const authenticateUser = require("../middleware/auth.middleware");

// Create booking
router.post(
    "/",
    authenticateUser,
    AppointmentController.createAppointment
);

// Get my provider history
router.get(
  "/provider/me/history",
  authenticateUser,
  AppointmentController.getMyProviderAppointmentHistory
);

// Get my provider bookings
router.get(
    "/provider/me",
    authenticateUser,
    AppointmentController.getMyProviderAppointments
);

// Get my customer bookings
router.get(
  "/customer/me",
  authenticateUser,
  AppointmentController.getMyCustomerAppointments
);

router.get("/available-times", async (req, res) => {
  try {
    const { providerProfileId, serviceId, appointmentDate } = req.query;

    if (!providerProfileId || !serviceId || !appointmentDate) {
      return res.status(400).json({
        error: "Missing required query params"
      });
    }

    const times = await AppointmentService.getAvailableTimes(
      providerProfileId,
      serviceId,
      appointmentDate
    );

    res.json({
      data: times
    });

  } catch (err) {
    console.error("AVAILABLE TIMES ERROR:", err);
    res.status(500).json({
      error: err.message
    });
  }
});

router.patch(
    "/:appointmentId/accept", 
    authenticateUser, 
    AppointmentController.acceptAppointment
);

router.patch("/:appointmentId/decline", 
    authenticateUser, 
    AppointmentController.declineAppointment
);

router.patch("/:appointmentId/cancel", 
    authenticateUser, 
    AppointmentController.cancelAppointment
);

module.exports = router;