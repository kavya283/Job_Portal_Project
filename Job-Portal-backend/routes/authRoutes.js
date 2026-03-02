const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const signToken = (user) => {
  return jwt.sign(
    { user: { id: user._id, role: user.role } },
    process.env.JWT_SECRET || "mysecretkey",
    { expiresIn: "1h" }
  );
};

/* ===================== SIGNUP ===================== */
router.post("/signup", async (req, res) => {
  const { name, companyName, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      companyName: role === "employer" ? companyName : undefined,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).json({ message: "Server error during signup" });
  }
});

/* ===================== LOGIN ===================== */
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  console.log(`Login attempt for: ${email}, Role: ${role}`);

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Password check FIRST
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Role validation
    if (role && user.role !== role) {
      return res.status(403).json({
        message: `Unauthorized. This account is registered as a ${user.role}.`,
      });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================== GOOGLE AUTH ===================== */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
    session: false,
  }),
  (req, res) => {
    const token = signToken(req.user);
    res.redirect(
      `http://localhost:5173/login-success?token=${token}&role=${req.user.role}`
    );


  }
);



/* ===================== LINKEDIN AUTH ===================== */
router.get("/linkedin", passport.authenticate("linkedin"));

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    failureRedirect: "http://localhost:5173/login",
    session: false,
  }),
  (req, res) => {
    const token = signToken(req.user);
    res.redirect(
      `http://localhost:5173/login-success?token=${token}&role=${req.user.role}`
    );

  }
);


module.exports = router;
