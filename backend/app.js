const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const userRoutes = require("./routes/userRoutes");
const canteenRoutes = require("./routes/canteenRoutes");
const campusRoutes = require("./routes/campusRoutes");
const cookieParser = require("cookie-parser");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/users", userRoutes);
app.use("/api/canteens", canteenRoutes);
app.use("/api/campuses", campusRoutes);

// Health check
app.get("/", (req, res) => {
    res.send("Campus Bites API is running 🚀");
});

// 404 fallback
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = app;
