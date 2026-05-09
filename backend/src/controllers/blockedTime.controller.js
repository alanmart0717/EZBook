const Provider = require("../models/provider.model");
const BlockedTime = require("../models/blockedTime.model");

const createBlockedTime = async (req, res) => {
  try {
    const provider = await Provider.getProviderByUserId(req.user.userId);

    if (!provider) {
      return res.status(403).json({ error: "Provider profile not found" });
    }

    const {
      label,
      repeatType,
      blockDate,
      dayOfWeek,
      dayOfMonth,
      startTime,
      endTime
    } = req.body;

    const blockedTime = await BlockedTime.createBlockedTime(
      provider.provider_profile_id,
      label,
      repeatType,
      blockDate,
      dayOfWeek,
      dayOfMonth,
      startTime,
      endTime
    );

    res.status(201).json({
      message: "Blocked time created successfully",
      data: blockedTime
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMyBlockedTimes = async (req, res) => {
  try {
    const provider = await Provider.getProviderByUserId(req.user.userId);

    if (!provider) {
      return res.status(403).json({ error: "Provider profile not found" });
    }

    const blockedTimes = await BlockedTime.getBlockedTimesByProviderId(
      provider.provider_profile_id
    );

    res.status(200).json({ data: blockedTimes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteBlockedTime = async (req, res) => {
  try {
    const { blockedTimeId } = req.params;

    const deleted = await BlockedTime.deleteBlockedTime(blockedTimeId);

    res.status(200).json({
      message: "Blocked time deleted",
      data: deleted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createBlockedTime,
  getMyBlockedTimes,
  deleteBlockedTime
};