const express = require("express");
const { registerUser, loginUser, logoutUser, forgotPass, resetPassword, loadUser, verifyEmail, getProfile, updateProfile, uploadProfileImage, getUserDetails, GoogleLogin, GoogleMobleLogin, GoogleMoileSignUp } = require("../controllers/userController");
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

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_HOST}/login`, session: false }),
  (req, res) => {

    const userObj = req.user.toObject ? req.user.toObject() : req.user;
    delete userObj.password;
    delete userObj.__v;
    const token = jwt.sign({ user: userObj }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log(req.user)
    res.redirect(`${process.env.FRONTEND_HOST}/login?token=${token}`);
  }
);
router.post("/google",getUserDetails)
router.post("/googleLogin",GoogleLogin);
router.post("/mobileGoogleLogin",GoogleMobleLogin);
router.post("/mobileGoogleSignUp",GoogleMoileSignUp);
module.exports = router;