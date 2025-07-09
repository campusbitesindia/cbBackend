const express = require("express");
const cors = require("cors");
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const dotenv = require("dotenv");

const userRoutes = require("./routes/userRoutes");
const canteenRoutes = require("./routes/canteenRoutes");
const campusRoutes = require("./routes/campusRoutes");
const paymentRoutes = require("./routes/paymentRoutes")
const webhookRoutes = require("./routes/webhookRoutes")

const cookieParser = require("cookie-parser");

const app = express();

// Security middleware
app.use(helmet())

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Payment specific rate limiting
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 payment requests per windowMs
})

// Body parsing middleware
app.use("/api/webhooks", webhookRoutes) // Webhooks need raw body
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))



// API routes
app.use("/api/users", userRoutes);
app.use("/api/canteens", canteenRoutes);
app.use("/api/campuses", campusRoutes);
app.use("/api/payments", paymentLimiter, paymentRoutes)

// Health check
app.get("/", (req, res) => {
    res.send("Campus Bites API is running 🚀");
});

// 404 fallback
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = app;
