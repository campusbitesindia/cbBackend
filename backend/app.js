const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const dotenv = require("dotenv")
const passport = require("passport")

// Import passport configuration
require("./config/passport")

const userRoutes = require("./routes/userRoutes")
const canteenRoutes = require("./routes/canteenRoutes")
const campusRoutes = require("./routes/campusRoutes")
const adminRoutes = require("./routes/adminRoutes")
const advancedRoutes = require("./routes/advancedRoutes")
const advanceRoutes = require("./routes/advanceRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const webhookRoutes = require("./routes/webhookRoutes")
const OrderRoutes = require("./routes/OrderRoutes")
const menuRoutes = require("./routes/menuRoutes")
const securityRoutes = require("./routes/securityRoutes") // 🔐 Smart Security Routes
const bankDetailsRoutes = require("./routes/bankDetailsRoutes") // Bank Details Routes
const payoutRoutes = require("./routes/payoutRoutes") // Payout Routes
const groupOrderRoutes = require("./routes/groupOrderRoutes");
const vendorAnalyticsRoutes = require("./routes/vendorAnalyticsRoutes");

const cookieParser = require("cookie-parser")
const itemRoutes = require("./routes/itemRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const notificationRoutes = require("./routes/notificationRoutes")

// 🔐 Smart Security Middleware
const { smartLoginMonitoring, registerDeviceOnLogin, checkVerificationRequired } = require("./middleware/smartSecurity")

const app = express()

// Security middleware
app.use(helmet())

// Initialize passport
app.use(passport.initialize())

// Middleware - Enhanced CORS for development
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", 'https://campus-bites-c7pe.vercel.app', 'https://cb-xx40.onrender.com'], // Allow frontend
    credentials: true, // Allow cookies
    optionsSuccessStatus: 200, // For legacy browser support
  }),
)
app.use(express.json())
app.use(cookieParser())

// 🔐 Smart Security: Device tracking and monitoring (applied globally)
app.use(smartLoginMonitoring)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
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

// 🔐 Smart Security: Post-login device registration and verification checks
app.use(registerDeviceOnLogin)
app.use(checkVerificationRequired)

// API routes
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/canteens", canteenRoutes)
app.use("/api/v1/order", OrderRoutes)
app.use("/api/v1/campuses", campusRoutes)
app.use("/api/v1/payments", paymentLimiter, paymentRoutes)
app.use("/api/v1/items", itemRoutes)
app.use("/api/v1/menu", menuRoutes)
app.use("/api/v1/reviews", reviewRoutes)
app.use("/api/v1/admin", adminRoutes)
app.use("/api/v1/security", securityRoutes) // 🔐 Smart Security API
app.use("/api/v1/adv", advanceRoutes)
app.use("/api/v1/notifications", notificationRoutes)
app.use("/api/v1/search", advancedRoutes)
app.use("/api/v1/bank-details", bankDetailsRoutes) // Bank Details API
app.use("/api/v1/payouts", payoutRoutes) // Payout API
app.use("/api/v1/groupOrder", groupOrderRoutes)
app.use("/api/v1/vendorAnalytics", vendorAnalyticsRoutes)

// Redirect for Google OAuth to allow shorter URL
app.get("/api/auth/google", (req, res) => {
  res.redirect("/api/v1/users/auth/google")
})

// Health check
app.get("/", (req, res) => {
  res.send("Campus Bites API is running 🚀")
})

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Export server
module.exports = app
