const bcrypt = require("bcryptjs");
const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const dbController = require('../controller/dbController');

const customFields = {
  usernameField: 'email',
  passwordField: 'password'
}

// Local Strategy for authentication
async function verifyLocalCallback(email, password, done) {
  try {
    const rows = await dbController.findUserByEmail(email);
    const user = rows[0];

    if (!user) {
      return done(null, false, { message: "Incorrect email/password" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return done(null, false, { message: "Incorrect password" });
    }

    return done(null, user);

  } catch(err) {
    return done(err);
  }
}
const localStrategy = new LocalStrategy(customFields, verifyLocalCallback);

// Serializers for local strategy signin and signout
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const rows = await dbController.findUserById(id);
    const user = rows[0];
    done(null, user);
  } catch(err) {
    done(err);
  }
});

module.exports = { passport,localStrategy };