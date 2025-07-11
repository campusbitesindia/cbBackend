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
    callbackURL: 'http://localhost:8080/api/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails && profile.emails[0] && profile.emails[0].value,
          role: 'student'
        });
      }
      // Issue JWT
      const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
      done(null, token);
    } catch (err) {
      done(err, null);
    }
  }
));

module.exports = passport; 