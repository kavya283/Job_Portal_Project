require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs"); 
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const passport = require("passport");
const session = require("express-session");

// Route Imports
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const employerRoutes = require("./routes/employerRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const resumeRoutes =require("./routes/resumeRoutes");

const app = express();
require("./config/passport");


const uploadDir = path.join(__dirname, "uploads");
const resumeDir = path.join(uploadDir, "resumes");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir);
}

// 2. CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());

app.use(session({
    secret: process.env.LINKEDIN_CLIENT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
// 3. Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());


// 4. Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 5. Socket.IO Setup
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: process.env.CLIENT_URL || "http://localhost:5173", 
    methods: ["GET", "POST"] 
  } 
});

// IMPORTANT: Name this "socketio" to match your Controllers
app.set("socketio", io); 

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (userId && userId !== "undefined") {
      const room = userId.toString();
      socket.join(room);
      console.log(`👤 User ${userId} joined room: ${room}`);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`❌ Client disconnected: ${socket.id} (${reason})`);
  });
});
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 6. Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/employer/profile", employerRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/resume" , resumeRoutes);

// 🔥 Multer Error Handler (IMPORTANT)
app.use((err, req, res, next) => {
  if (err instanceof require("multer").MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.message && err.message.includes("Only .pdf")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
});


// ... (error handling and startServer)
app.use((err, req, res, next) => {
  console.error("Server Error Stack:", err.stack);
  res.status(500).json({ message: "Something went wrong on the server!", error: err.message });
});

// 8. Database and Server Start
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }
    await connectDB();
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("Critical Server Startup Error:", error.message);
    process.exit(1);
  }
};

startServer();