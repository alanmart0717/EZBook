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

module.exports = router;