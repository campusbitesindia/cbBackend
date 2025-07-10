const rateLimit = require("express-rate-limit")

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  }, 
  standardHeaders: true,
  legacyHeaders: false,
})

// Payment specific rate limiter (more restrictive)
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 payment requests per windowMs
  message: {
    success: false,
    message: "Too many payment requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Webhook rate limiter
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // limit each IP to 50 webhook requests per minute
  message: {
    success: false,
    message: "Too many webhook requests from this IP.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  generalLimiter,
  paymentLimiter,
  webhookLimiter,
}
