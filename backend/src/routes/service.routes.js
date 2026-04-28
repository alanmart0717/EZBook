const express = require("express");
const router = express.Router();

const ServiceController = require("../controllers/service.controller");

const authenticateUser = require("../middleware/auth.middleware");
const authorizeRole = require("../middleware/role.middleware");

// Get all services
// Public route so customers/homepage can browse services
router.get(
    "/",
    ServiceController.getAllServices
);

// Create service
// Provider-only route
router.post(
    "/",
    authenticateUser,
    authorizeRole(["provider"]),
    ServiceController.createService
);

router.delete(
    "/:serviceId",
    authenticateUser,
    authorizeRole(["provider"]),
    ServiceController.deleteService
);

module.exports = router;