const express = require("express");
const router = express.Router();
const {
  sendNotificationToUser,
  getUserNotifications
} = require("../controllers/notificationController");

router.post("/user", sendNotificationToUser);
router.get("/user/:id", getUserNotifications);

module.exports = router;