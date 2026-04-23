const express = require("express");
const router = express.Router();

const ProviderController = require("../controllers/provider.controller");

const authenticateUser = require("../middleware/auth.middleware");
const authorizeRole = require("../middleware/role.middleware");

// Create profile
router.post(
    "/",
    authenticateUser,
    authorizeRole(["provider"]),
    ProviderController.createProfile
);

// Get profile
router.get(
    "/me",
    authenticateUser,
    authorizeRole(["provider"]),
    ProviderController.getMyProfile
);

module.exports = router;