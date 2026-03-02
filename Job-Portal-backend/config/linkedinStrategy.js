const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const axios = require("axios");
const User = require("../models/User");

module.exports = (passport) => {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/api/auth/linkedin/callback",
        scope: ["openid", "profile", "email"],
        skipUserProfile: true  
      },

      async (accessToken, refreshToken, profile, done) => {
        try {
          // Fetch OpenID user info manually
          const { data } = await axios.get(
            "https://api.linkedin.com/v2/userinfo",
            {
              headers: { Authorization: `Bearer ${accessToken}` }
            }
          );

          console.log("LinkedIn userinfo:", data);

          const linkedinId = data.sub;
          const email = data.email || "";
          const name = data.name || "LinkedIn User";

          let user = await User.findOne({ linkedinId });

          if (!user) {
            user = await User.create({
              name,
              email,
              linkedinId,
              provider: "linkedin",
              role: "candidate"
            });
          }

          return done(null, user);
        } catch (err) {
          console.error("LinkedIn Fetch Error:", err.response?.data || err);
          return done(err, null);
        }
      }
    )
  );
};
