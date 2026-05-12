const express = require("express");
const router = express.Router();

const BlockedTimeController = require("../controllers/blockedTime.controller");
const authenticateUser = require("../middleware/auth.middleware");

router.get(
  "/me",
  authenticateUser,
  BlockedTimeController.getMyBlockedTimes
);

router.post(
  "/",
  authenticateUser,
  BlockedTimeController.createBlockedTime
);

router.delete(
  "/:blockedTimeId",
  authenticateUser,
  BlockedTimeController.deleteBlockedTime
);

module.exports = router;
