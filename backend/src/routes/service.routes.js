const express = require("express");
const router = express.Router();

const ServiceController = require("../controllers/service.controller");

const authenticateUser = require("../middleware/auth.middleware");
const authorizeRole = require("../middleware/role.middleware");

router.post(
    "/",
    authenticateUser,
    authorizeRole(["provider"]),
    ServiceController.createService
);

module.exports = router;