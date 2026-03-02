const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error("Google account has no email"), null);
          }

          let user = await User.findOne({ email });

          // ✅ create user if not exists
          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email,
              provider: "google",
              role: "candidate"
            });
          }

          // ✅ create JWT token for your app login
          const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
          );

          // send both user + token forward
          return done(null, user);

        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
};
