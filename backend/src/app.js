const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// Auth routes
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

// Provider profile routes
const providerProfileRoutes = require("./routes/provider.profile.routes");
app.use("/api/provider/profile", providerProfileRoutes);

// Provider availability routes
const providerAvailabilityRoutes = require("./routes/provider.availability.routes");
app.use("/api/provider/availability", providerAvailabilityRoutes);

// Provider blocked time routes
const blockedTimeRoutes = require("./routes/provider.blockedTime.routes");
app.use("/api/provider/blocked-times", blockedTimeRoutes);

// Service routes
const serviceRoutes = require("./routes/service.routes");
app.use("/api/services", serviceRoutes);

// Appointment routes
const appointmentRoutes = require("./routes/appointments.routes");
app.use("/api/appointments", appointmentRoutes);

// Notification routes
const notificationRoutes = require("./routes/notification.routes");
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({ message: "EZbook API is running" });
});


// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Something went wrong on the server"
    });
});

module.exports = app;