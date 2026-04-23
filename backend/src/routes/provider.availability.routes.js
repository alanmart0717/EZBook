const express = require("express");
const router = express.Router();

const AvailabilityController = require("../controllers/availability.controller");

const authenticateUser = require("../middleware/auth.middleware");
const authorizeRole = require("../middleware/role.middleware");

// Add availability slot
router.post(
    "/",
    authenticateUser,
    authorizeRole(["provider"]),
    AvailabilityController.addAvailability
);

// Get my availability
router.get(
    "/me",
    authenticateUser,
    authorizeRole(["provider"]),
    AvailabilityController.getMyAvailability
);

// Delete availability slot
router.delete(
    "/:availabilityId",
    authenticateUser,
    authorizeRole(["provider"]),
    AvailabilityController.deleteAvailability
);

module.exports = router;