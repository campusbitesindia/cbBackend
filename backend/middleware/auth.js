const jwt = require("jsonwebtoken")
const user = require("../models/User.js")
const Canteen = require("../models/Canteen")

exports.isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.replace("Bearer ", ""))
    
    if (!token || token === "j:null" || token === "null") {
      return res.status(401).json({
        success: false,
        message: "Not logged in currently. Please login to access this resource.",
      })
    }
    
    const decodedData = jwt.verify(token, process.env.JWT_SECRET)
    console.log(decodedData);
    const user1 = await user.findById(decodedData.id).populate("campus canteenId")
    
    if (!user1) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      })
    }

    if (user1.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned. Contact support.",
      })
    }

    // Attach user with consistent ID format
    req.user = {
      ...user1.toObject(),
      id: user1._id.toString(), // Ensure consistent ID format 
    }
    
    next()
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Authentication error: ${error.message}`,
    })
  }
}

exports.isStudent = async (req, res, next) => {
  try {
    const role = req.user.role
    if (role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Access denied. This resource is only for students.",
      })
    }
    next()
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    })
  }
}

exports.isVendor = async (req, res, next) => {
  try {
    const role = req.user.role
    if (role === "student") {
      return res.status(403).json({
        success: false,
        message: "Access denied. This resource is only for vendors/canteen owners.",
      })
    }

    // Check if vendor's canteen is approved
    const canteen = await Canteen.findOne({
      owner: req.user._id,
      isDeleted: false,
    })

    if (!canteen) {
      return res.status(404).json({
        success: false,
        message: "No canteen found for this vendor.",
      })
    }

    if (!canteen.isApproved || canteen.approvalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your canteen is not approved yet. Please wait for admin approval.",
        approvalStatus: canteen.approvalStatus,
        canteenId: canteen._id,
      })
    }

    // Attach canteen info to request
    req.canteen = canteen
    
    next()
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    })
  }
}

exports.isAdmin = async (req, res, next) => {
  try {
    const role = req.user.role
    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. This resource is only for administrators.",
      })
    }
    next()
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    })
  }
}

exports.isAdminEnv = async (req, res, next) => {
  try {
    const token =
      req.cookies.admin_token ||
      (req.headers.authorization && req.headers.authorization.replace("Bearer ", ""));

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not logged in as admin",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Not admin",
      });
    }

    // Fetch admin user from DB and attach to req.user
    let adminUser = await user.findOne({ role: "admin", email: decoded.username || decoded.email });
    if (!adminUser) {
      // fallback: get any admin
      adminUser = await user.findOne({ role: "admin" });
      if (!adminUser) {
        return res.status(401).json({
          success: false,
          message: "Admin user not found in database",
        });
      }
    }
    req.user = adminUser;
    req.admin = { username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};
