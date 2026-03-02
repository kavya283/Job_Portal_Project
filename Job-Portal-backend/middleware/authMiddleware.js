const jwt = require("jsonwebtoken");

/* =========================
    AUTHENTICATION MIDDLEWARE
   ========================= */
const authMiddleware = (req, res, next) => {
  // 1. Extract token from multiple possible sources
  const authHeader = req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") 
    ? authHeader.split(" ")[1] 
    : req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // 2. Verify Token
    // Ensure you use the exact same secret used in your Login controller
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "mysecretkey"
    );

    // 3. Extract user data safely
    // Some JWT strategies wrap data in a { user: { ... } } object, others don't.
    const userData = decoded.user || decoded;

    // 4. DEFENSIVE NORMALIZATION
    // This is the "Fix" for the 500 errors we saw earlier
    const rawId = userData.id || userData._id || userData.sub; 
    
    if (!rawId) {
      console.error("Auth Error: Token valid but User ID missing in payload.");
      return res.status(401).json({ message: "Invalid token structure: missing ID" });
    }

    // 5. Standardize req.user
    // We attach it to req so all following controllers can use it
    req.user = {
      ...userData,
      id: rawId.toString(),
      _id: rawId.toString(),
      role: userData.role || "candidate" // Defaulting to candidate if role is missing
    };

    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    
    // Specifically handle expiration for clearer frontend feedback
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    
    return res.status(401).json({ message: "Token is not valid" });
  }
};

/* =========================
    ROLE GUARDS
   ========================= */
// These MUST be used AFTER authMiddleware in your routes
const employerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "employer") {
    return res.status(403).json({ message: "Access denied: Employer role required" });
  }
  next();
};

const candidateOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "candidate") {
    return res.status(403).json({ message: "Access denied: Candidate role required" });
  }
  next();
};

module.exports = {
  authMiddleware,
  employerOnly,
  candidateOnly,
};