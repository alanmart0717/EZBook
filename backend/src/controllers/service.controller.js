const Provider = require("../models/provider.model");
const ServiceService = require("../services/service.service");
const Service = require("../models/service.model");
console.log("SERVICE MODEL FUNCTIONS:", Object.keys(Service));
const Appointment = require("../models/appointment.model");

// Get all services
const getAllServices = async (req, res) => {
    try {
        const services = await ServiceService.getAllServices();

        res.status(200).json({
            data: services
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// Create service
const createService = async (req, res) => {
    try {
        const provider = await Provider.getProviderByUserId(req.user.userId);

        if (!provider) {
            return res.status(403).json({
                error: "Provider profile not found. Please create one first."
            });
        }

        const service = await ServiceService.createService(
            provider.provider_profile_id,
            req.body
        );

        res.status(201).json({
            message: "Service created successfully",
            data: service
        });

    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { cancelAppointments } = req.query;

    const provider = await Provider.getProviderByUserId(req.user.userId);

    if (!provider) {
      return res.status(403).json({
        error: "Provider profile not found"
      });
    }

    const shouldCancelAppointments = cancelAppointments === "true";

    if (shouldCancelAppointments) {
      await Appointment.cancelAppointmentsByServiceId(serviceId);
    }

    const deletedService = await Service.deleteService(
      serviceId,
      provider.provider_profile_id
    );

    if (!deletedService) {
      return res.status(404).json({
        error: "Service not found or you do not own this service."
      });
    }

    res.json({
      message: shouldCancelAppointments
        ? "Service deleted and appointments cancelled"
        : "Service deleted successfully",
      data: deletedService
    });

  } catch (err) {
    console.error("DELETE SERVICE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const archiveService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { cancelAppointments } = req.query;

    const provider = await Provider.getProviderByUserId(req.user.userId);

    if (!provider) {
      return res.status(403).json({ error: "Provider not found" });
    }

    const service = await Service.getServiceById(serviceId);

    if (
      !service ||
      String(service.provider_profile_id) !== String(provider.provider_profile_id)
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (cancelAppointments === "true") {
      await Appointment.cancelFutureAppointmentsByService(serviceId);
    }

    const archivedService = await Service.archiveService(serviceId);

    res.json({
      message:
        cancelAppointments === "true"
          ? "Service archived and future appointments cancelled"
          : "Service archived successfully",
      data: archivedService,
    });
  } catch (err) {
    console.error("ARCHIVE SERVICE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const getMyArchivedServices = async (req, res) => {
  try {
    const provider = await Provider.getProviderByUserId(req.user.userId);

    if (!provider) {
      return res.status(403).json({
        error: "Provider profile not found"
      });
    }

    const services = await Service.getArchivedServicesByProviderId(
      provider.provider_profile_id
    );

    res.json({
      message: "Archived services fetched successfully",
      data: services,
    });
  } catch (err) {
    console.error("GET ARCHIVED SERVICES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const unarchiveService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const provider = await Provider.getProviderByUserId(req.user.userId);

    if (!provider) {
      return res.status(403).json({ error: "Provider not found" });
    }

    const service = await Service.getServiceById(serviceId);

    if (
      !service ||
      String(service.provider_profile_id) !== String(provider.provider_profile_id)
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const restoredService = await Service.unarchiveService(serviceId);

    res.json({
      message: "Service restored successfully",
      data: restoredService,
    });
  } catch (err) {
    console.error("UNARCHIVE SERVICE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
    getAllServices,
    createService,
    deleteService,
    archiveService,
    getMyArchivedServices,
    unarchiveService
};