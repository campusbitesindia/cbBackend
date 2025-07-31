const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: __dirname + '/config.env' });
const User = require('../models/User');

// Configure Google OAuth strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/v1/users/auth/google/callback', // Remove localhost to make it relative
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create userz
      let user = await User.findOne({ googleId: profile.id });
      let token=null;
      if (user) {
        const payload = { id: user._id, email: user.email, role: user.role };
      token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
      }
      // Issue JWT
      
      console.log(token);
      done(null, token);
    } catch (err) {
      done(err, null);
    }
  }
));

module.exports = passport; 