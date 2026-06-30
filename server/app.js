const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");
const env = require("./config/env");

const app = express();

// Security - skip proxy paths to avoid overwriting proxied response headers
const helmetConfig = {
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameSrc: ["'self'", "http://localhost:5000", "wss://live-class-2xabczgn.livekit.cloud"],
      frameAncestors: ["'self'", env.CLIENT_URL],
      connectSrc: ["'self'", "https://live-class-2xabczgn.livekit.cloud", "wss://live-class-2xabczgn.livekit.cloud"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      mediaSrc: ["'self'", "blob:", "wss://live-class-2xabczgn.livekit.cloud"],
      workerSrc: ["'self'", "blob:"],
    },
  },
  frameguard: false,
};
app.use(helmet(helmetConfig));
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use("/api", apiLimiter);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/modules", require("./routes/modules"));
app.use("/api/lessons", require("./routes/lessons"));
app.use("/api/enrollments", require("./routes/enrollments"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/assignments", require("./routes/assignments"));
app.use("/api/submissions", require("./routes/submissions"));
app.use("/api/quizzes", require("./routes/quizzes"));
app.use("/api/grades", require("./routes/grades"));
app.use("/api/meetings", require("./routes/meetings"));
app.use("/api/livekit", require("./routes/livekit"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/subscriptions", require("./routes/subscriptions"));
app.use("/api/invoices", require("./routes/invoices"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/certificates", require("./routes/certificates"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/certificate-templates", require("./routes/certificateTemplates"));
app.use("/api/announcements", require("./routes/announcements"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Live Class Code API is running", timestamp: new Date().toISOString() });
});



// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use(errorHandler);

module.exports = app;
