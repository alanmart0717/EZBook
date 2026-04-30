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

// Delete service
router.delete(
    "/:serviceId",
    authenticateUser,
    authorizeRole(["provider"]),
    ServiceController.deleteService
);

// Archive service
router.patch(
  "/:serviceId/archive",
  authenticateUser,
  authorizeRole(["provider"]),
  ServiceController.archiveService
);

// Unarchive service
router.patch(
  "/:serviceId/unarchive",
  authenticateUser,
  authorizeRole(["provider"]),
  ServiceController.unarchiveService
);

// Get archived service
router.get(
  "/provider/me/archived",
  authenticateUser,
  ServiceController.getMyArchivedServices
);

module.exports = router;