const express = require("express");
const router = express.Router();

const AppointmentController = require("../controllers/appointment.controller");

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

router.get(
  "/available-times",
  AppointmentController.getAvailableTimes
);

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