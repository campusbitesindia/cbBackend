const express = require("express");
const router = express.Router();
const {
  sendNotificationToUser,
  getUserNotifications,
  sendPublicKey,
  savePushSubscription
} = require("../controllers/notificationController");

router.post("/user", sendNotificationToUser);
router.get("/user/:id", getUserNotifications);
router.get("/publicKey",sendPublicKey);
router.post("/subscribe", savePushSubscription);
module.exports = router;