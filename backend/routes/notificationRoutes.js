const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  sendPublicKey,
  saveSubscription
} = require("../controllers/notificationController");

router.get("/user/:id", getUserNotifications);
router.get("/publicKey",sendPublicKey);
router.post("/subscribe", saveSubscription);
module.exports = router;