const express = require("express");
const { registerUser, loginUser, logoutUser, forgotPass, resetPassword, loadUser, verifyEmail, getProfile, updateProfile, uploadProfileImage, getUserDetails } = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/auth");
const upload = require("../middleware/uploadMiddleware");
const passport = require("passport");
const { smartLoginMonitoring } = require("../middleware/smartSecurity");
const dotenv=require('dotenv');
dotenv.config();
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/verify-email").post(verifyEmail);
router.route("/login").post(smartLoginMonitoring,loginUser);
router.route("/logout").post(logoutUser);
router.route("/forgotPass").post(forgotPass);
router.route("/resetPassword/:token").post(resetPassword);
router.route("/me").get(isAuthenticated, loadUser);

// Profile management routes
router.route("/profile").get(isAuthenticated, getProfile);
router.route("/profile").put(isAuthenticated, updateProfile);
router.route("/profile/image").post(isAuthenticated, upload.single('profileImage'), uploadProfileImage);

// // Google OAuth
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_HOST}/login`, session: false }),
  (req, res) => { 
    // On success, redirect with a token
    res.redirect(`${FRONTEND_HOST}/login?token=${req.user}`);
  }
);
router.post("/google",getUserDetails)
module.exports = router;