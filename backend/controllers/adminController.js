const User = require("../models/User")
const Campus = require("../models/Campus")
const Canteen = require("../models/Canteen")
const Transaction = require("../models/Transaction")
const Penalty=require("../models/penaltySchema");
const CampusRequest = require("../models/campusRequest")
const Payout = require("../models/Payout")
const SendNotification=require("../utils/sendNotification")
exports.getTotalCounts = async (req, res) => {
  try {
    const [userCount, campusCount, canteenCount] = await Promise.all([
      User.countDocuments(),
      Campus.countDocuments(),
      Canteen.countDocuments(),
    ])

    res.status(200).json({
      totalUsers: userCount,
      totalCampuses: campusCount,
      totalCanteens: canteenCount,
    })
  } catch (error) {
    console.error("Error getting total counts:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getMonthlyUserCount = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    res.json(users)
  } catch (error) {
    console.error("Error getting monthly user count:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getUserCountByRole = async (req, res) => {
  try {
    const roles = await User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }])
    res.json(roles)
  } catch (error) {
    console.error("Error getting user count by role:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const mongoose = require("mongoose")
const Order = require("../models/Order")

exports.getTopUsersBySpending = async (req, res) => {
  try {
    const topUsers = await Order.aggregate([
      {
        $match: {
          status: { $in: ["completed", "placed"] },
        },
      },
      {
        $group: {
          _id: "$student",
          totalSpent: { $sum: "$total" },
        },
      },
      { $sort: { totalSpent: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          name: "$userInfo.name",
          email: "$userInfo.email",
          totalSpent: 1,
        },
      },
    ])
    res.json(topUsers)
  } catch (error) {
    console.error("Error getting top users by spending:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getUsersByRoleList = async (req, res) => {
  try {
    const [students, owners] = await Promise.all([
      User.find({ role: "student" }).select("name email role isBanned"),
      User.find({ role: "canteen" }).select("name email role isBanned"),
    ])
    res.json({ students, canteenOwners: owners })
  } catch (error) {
    console.error("Error getting users by role list:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getMonthlyOrders = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: { $ifNull: ["$createdAt", "$placedAt"] },
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    res.json(data)
  } catch (error) {
    console.error("Monthly orders error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getOrdersByCampusCanteen = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "canteens",
          localField: "canteen",
          foreignField: "_id",
          as: "canteenInfo",
        },
      },
      { $unwind: "$canteenInfo" },
      {
        $lookup: {
          from: "campus",
          localField: "canteenInfo.campus",
          foreignField: "_id",
          as: "campusInfo",
        },
      },
      { $unwind: "$campusInfo" },
      {
        $group: {
          _id: {
            campusId: "$campusInfo._id",
            campusName: "$campusInfo.name",
            canteenId: "$canteenInfo._id",
            canteenName: "$canteenInfo.name",
          },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          campusId: "$_id.campusId",
          campusName: "$_id.campusName",
          canteenId: "$_id.canteenId",
          canteenName: "$_id.canteenName",
          totalOrders: 1,
        },
      },
      {
        $sort: {
          totalOrders: -1,
        },
      },
    ])

    res.json(data)
  } catch (error) {
    console.error("Orders by campus/canteen error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getOrderStatusBreakdown = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])
    res.json(data)
  } catch (error) {
    console.error("Order status breakdown error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getTopCanteensByOrderVolume = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: "$canteen",
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "canteens",
          localField: "_id",
          foreignField: "_id",
          as: "canteenInfo",
        },
      },
      { $unwind: "$canteenInfo" },
      {
        $project: {
          name: "$canteenInfo.name",
          campus: "$canteenInfo.campus",
          totalOrders: 1,
        },
      },
    ])
    res.json(data)
  } catch (error) {
    console.error("Top canteens error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getAverageOrderValue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: null,
          averageValue: { $avg: "$total" },
        },
      },
    ])
    res.json({ averageOrderValue: result[0]?.averageValue || 0 })
  } catch (error) {
    console.error("Average order value error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getPeakOrderTimes = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $project: {
          hour: { $hour: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$hour",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    res.json(data)
  } catch (error) {
    console.error("Peak order time error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getTotalRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }])
    res.json({ totalRevenue: result[0]?.total || 0 })
  } catch (error) {
    console.error("Total revenue error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getRevenueByCampusAndCanteen = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $lookup: {
          from: "canteens",
          localField: "canteen",
          foreignField: "_id",
          as: "canteenInfo",
        },
      },
      { $unwind: "$canteenInfo" },
      {
        $lookup: {
          from: "campus",
          localField: "canteenInfo.campus",
          foreignField: "_id",
          as: "campusInfo",
        },
      },
      { $unwind: "$campusInfo" },
      {
        $group: {
          _id: {
            campusId: "$campusInfo._id",
            campusName: "$campusInfo.name",
            canteenId: "$canteenInfo._id",
            canteenName: "$canteenInfo.name",
          },
          revenue: { $sum: "$total" },
        },
      },
      {
        $project: {
          _id: 0,
          campusId: "$_id.campusId",
          campusName: "$_id.campusName",
          canteenId: "$_id.canteenId",
          canteenName: "$_id.canteenName",
          revenue: 1,
        },
      },
      {
        $sort: {
          campusName: 1,
          canteenName: 1,
        },
      },
    ])

    res.json(data)
  } catch (error) {
    console.error("Revenue by campus/canteen error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

exports.getTopCanteensByRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: "$canteen",
          totalRevenue: { $sum: "$total" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "canteens",
          localField: "_id",
          foreignField: "_id",
          as: "canteen",
        },
      },
      { $unwind: "$canteen" },
      {
        $project: {
          name: "$canteen.name",
          campus: "$canteen.campus",
          totalRevenue: 1,
        },
      },
    ])
    res.json(result)
  } catch (error) {
    console.error("Top canteens by revenue error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

exports.getTopCampusesByRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $lookup: {
          from: "canteens",
          localField: "canteen",
          foreignField: "_id",
          as: "canteenInfo",
        },
      },
      { $unwind: "$canteenInfo" },
      {
        $lookup: {
          from: "campus",
          localField: "canteenInfo.campus",
          foreignField: "_id",
          as: "campusInfo",
        },
      },
      { $unwind: "$campusInfo" },
      {
        $group: {
          _id: {
            campusId: "$campusInfo._id",
            campusName: "$campusInfo.name",
          },
          totalRevenue: { $sum: "$total" },
        },
      },
      {
        $project: {
          _id: 0,
          campusId: "$_id.campusId",
          campusName: "$_id.campusName",
          totalRevenue: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
    ])

    res.json(result)
  } catch (error) {
    console.error("Top campuses error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

exports.getRevenueByPaymentMethod = async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      {
        $match: {
          isDeleted: false,
          status: "paid",
        },
      },
      {
        $group: {
          _id: "$mode",
          totalRevenue: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          paymentMethod: "$_id",
          totalRevenue: 1,
        },
      },
    ])

    res.json(result)
  } catch (error) {
    console.error("Payment method breakdown error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

exports.getDailyRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: { $ifNull: ["$createdAt", "$placedAt"] } } },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ])
    res.json(result)
  } catch (error) {
    console.error("Daily revenue error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

exports.getWeeklyRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%U", date: { $ifNull: ["$createdAt", "$placedAt"] } } },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ])
    res.json(result)
  } catch (error) {
    console.error("Weekly revenue error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

exports.getMonthlyRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: { $ifNull: ["$createdAt", "$placedAt"] } } },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ])
    res.json(result)
  } catch (error) {
    console.error("Monthly revenue error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

exports.banUser = async (req, res) => {
  try {
    const { userId, ban } = req.body
    await User.findByIdAndUpdate(userId, { isBanned: ban })
    res.json({ message: ban ? "User has been banned." : "User has been unbanned." ,success:true})
  } catch (error) {
    console.error("Error banning user:", error)
    res.status(500).json({ message: "Server error",succcess:false })
  }
}

exports.suspendCanteen = async (req, res) => {
  try {
    const { canteenId, suspend } = req.body
    const canteen = await Canteen.findByIdAndUpdate(canteenId, { isSuspended: suspend }, { new: true })
    if (canteen?.owner) {
      await User.findByIdAndUpdate(canteen.owner, { isBanned: suspend })
    }
    res.json({ success:true,  message: suspend ? "Canteen suspended and owner banned." : "Canteen unsuspended and owner unbanned." })
  } catch (error) {
    console.error("Error suspending/unsuspending canteen:", error)
    res.status(500).json({ success:false, message: "Server error" })
  }
}

exports.adminRateVendor = async (req, res) => {
  try {
    const { canteenId, rating, feedback } = req.body

    const canteen = await Canteen.findById(canteenId)
    if (!canteen) return res.status(404).json({ message: "Canteen not found" })

    canteen.adminRatings = canteen.adminRatings || []
    canteen.adminRatings.push({ rating, feedback, date: new Date() })
    await canteen.save()

    res.json({ message: "Admin rating submitted.",success:true })
  } catch (error) {
    console.error("Error rating vendor:", error)
    res.status(500).json({ message: "Server error",success:false })
  }
}

exports.getCampusesSummary = async (req, res) => {
  try {
    const campuses = await Campus.find()

    const result = await Promise.all(
      campuses.map(async (campus) => {
        const userCount = await User.countDocuments({ campus: campus._id })
        const canteenCount = await Canteen.countDocuments({ campus: campus._id })
        return {
          campusId: campus._id,
          name: campus.name,
          code: campus.code,
          city: campus.city,
          userCount,
          canteenCount,
        }
      }),
    )
    res.status(200).json({
      success: true,
      campuses: result,
    })
  } catch (error) {
    console.error("Error fetching campus summary:", error)
    res.status(500).json({ success: false, message: "Server Error" })
  }
}

exports.getCampusUsers = async (req, res) => {
  try {
    const campusId = req.params.campusId
    const users = await User.find({ campus: campusId }).select("name email role")

    res.status(200).json({
      success: true,
      users,
    })
  } catch (error) {
    console.error("Error fetching campus users:", error)
    res.status(500).json({ success: false, message: "Server Error" })
  }
}

exports.getCampusCanteens = async (req, res) => {
  try {
    const campusId = req.params.campusId
    const canteens = await Canteen.find({ campus: campusId }).select("name isOpen owner")

    res.status(200).json({
      success: true,
      canteens,
    })
  } catch (error) {
    console.error("Error fetching campus canteens:", error)
    res.status(500).json({ success: false, message: "Server Error" })
  }
}

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("campus canteenId")

    if (!user) return res.status(404).json({ success: false, message: "User not found" })

    res.status(200).json({ success: true, user })
  } catch (error) {
    console.error("Error getting user details:", error)
    res.status(500).json({ success: false, message: "Server Error" })
  }
}

exports.getCanteenDetails = async (req, res) => {
  try {
    const canteen = await Canteen.findById(req.params.canteenId).populate("owner campus").populate({
      path: "items",
      select: "name price available",
    })

    if (!canteen) return res.status(404).json({ success: false, message: "Canteen not found" })

    res.status(200).json({ success: true, canteen })
  } catch (error) {
    console.error("Error getting canteen details:", error)
    res.status(500).json({ success: false, message: "Server Error" })
  }
}

exports.submitCampusRequest = async (req, res) => {
  try {
    const { name, email, mobile, role, collegeName, city, message } = req.body

    if (!name || !email || !mobile || !role || !collegeName || !city) {
      return res.status(400).json({ success: false, message: "All required fields must be filled." })
    }

    const newRequest = await CampusRequest.create({
      name,
      email,
      mobile,
      role,
      collegeName,
      city,
      message,
    })

    return res.status(200).json({
      success: true,
      message: "Campus request submitted successfully. We’ll get back to you shortly!",
    })
  } catch (error) {
    console.error("Campus Request Error:", error)
    res.status(500).json({ success: false, message: "Server Error" })
  }
}

exports.getAllCanteens = async (req, res) => {
  try {
    const canteens = await Canteen.find()
    res.status(200).json({ success: true, canteens })
  } catch (error) {
    console.error("Error fetching all canteens:", error)
    res.status(500).json({ success: false, message: "Server Error" })
  }
}

// Get all campus requests
exports.getAllCampusRequests = async (req, res) => {
  try {
    const requests = await CampusRequest.find()
    res.status(200).json({ success: true, requests })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" })
  }
}

// Approve or reject a campus request
exports.reviewCampusRequest = async (req, res) => {
  try {
    const { id } = req.params
    const { approved } = req.body
    const request = await CampusRequest.findById(id)
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" })
    }
    request.isReviewed = true
    request.approved = approved
    await request.save()
    const Owner=await User.findOne({email:request.email});
    await SendNotification(Owner._id,"Campus Request",`Your request has been ${approved}`);
    await 
    res.status(200).json({ success: true, message: `Campus request ${approved ? "approved" : "rejected"}.` })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" })
  }
}

// Create admin account
exports.createAdminAccount = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      })
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email })
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin account with this email already exists",
      })
    }

    // Hash password
    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash(password, 10)

    // Find or create a default campus
    let campus = await Campus.findOne({ name: "Main Campus" })
    if (!campus) {
      campus = await Campus.create({
        name: "Main Campus",
        code: "MC",
        city: "University City",
      })
    }

    // Create admin user
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      campus: campus._id,
      is_verified: true,
    })

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      admin: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("Error creating admin account:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

const jwt = require("jsonwebtoken");
const { sendMail } = require("../utils/sendMail");

exports.adminLogin = (req, res) => {
  const { username, password } = req.body
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

  console.log(username,ADMIN_USERNAME,password,ADMIN_PASSWORD)

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Invalid admin credentials" })
  }

  // Issue a JWT token for admin
  const token = jwt.sign({ role: "admin", username: ADMIN_USERNAME }, process.env.JWT_SECRET, { expiresIn: "24h" })
  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  })
  return res.status(200).json({ success: true, token })
}

// Add these new functions to adminController.js

exports.getPendingVendors = async (req, res) => {
  try {
    const pendingCanteens = await Canteen.find({
      approvalStatus: "pending",
      isDeleted: false,
    })
      .populate("owner", "name email phone createdAt")
      .populate("campus", "name code city")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      message: "Pending vendors fetched successfully",
      data: pendingCanteens,
      count: pendingCanteens.length,
    })
  } catch (error) {
    console.error("Error fetching pending vendors:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

exports.approveVendor = async (req, res) => {
  try {
    const { canteenId } = req.params
    const { approved, rejectionReason } = req.body
    const adminId = req.user && req.user._id ? req.user._id : null
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Admin not authenticated" })
    }

    if (typeof approved !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Please specify whether to approve (true) or reject (false)",
      })
    }

    const canteen = await Canteen.findById(canteenId).populate("owner")
    if (!canteen) {
      return res.status(404).json({
        success: false,
        message: "Canteen not found",
      })
    }

    // Optional: Add FSSAI validation for food businesses
    if (!canteen.fssaiLicense) {
      console.log(`Warning: Canteen ${canteen.name} approved without FSSAI license`)
    }

    if (canteen.approvalStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Canteen is already ${canteen.approvalStatus}`,
      })
    }

    // Update canteen approval status
    canteen.approvalStatus = approved ? "approved" : "rejected"
    canteen.isApproved = approved
    canteen.approvedBy = adminId
    canteen.approvedAt = new Date()

    if (approved) {
      canteen.isOpen = true // Allow canteen to operate
    } else {
      canteen.rejectionReason = rejectionReason || "Not specified"
    }

    await canteen.save()
    const Owner=await User.findById(canteen.owner);
    await sendMail(Owner.email,"Canteen Request Update",`Request for Your canteen has been ${approved}`)
    // Update user status if needed
    const owner = canteen.owner
    if (owner) {
      if (approved) owner.isApproved = true
      await owner.save()
    }

    res.status(200).json({
      success: true,
      message: `Vendor ${approved ? "approved" : "rejected"} successfully`,
      data: {
        canteenId: canteen._id,
        canteenName: canteen.name,
        ownerName: owner.name,
        ownerEmail: owner.email,
        status: canteen.approvalStatus,
        approvedAt: canteen.approvedAt,
        rejectionReason: canteen.rejectionReason,
      },
    })
  } catch (error) {
    console.error("Error approving vendor:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

exports.getVendorDetails = async (req, res) => {
  try {
    const { canteenId } = req.params

    const canteen = await Canteen.findById(canteenId)
      .populate("owner", "name email phone createdAt profileImage")
      .populate("campus", "name code city")
      .populate("approvedBy", "name email")

    if (!canteen) {
      return res.status(404).json({
        success: false,
        message: "Canteen not found",
      })
    }

    // Get order statistics for this canteen
    const orderStats = await Order.aggregate([
      { $match: { canteen: canteen._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
    ])

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      completedOrders: 0,
    }

    res.status(200).json({
      success: true,
      data: {
        canteen,
        statistics: stats,
        approvalHistory: {
          status: canteen.approvalStatus,
          approvedBy: canteen.approvedBy,
          approvedAt: canteen.approvedAt,
          rejectionReason: canteen.rejectionReason,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching vendor details:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Create a payout record (admin to vendor)
exports.createPayout = async (req, res) => {
  try {
    const { canteenId, trnId, date, amount, notes } = req.body
    const adminId = req.user._id
    if (!canteenId || !trnId || !date || !amount) {
      return res.status(400).json({ success: false, message: "All fields except notes are required." })
    }
    // Backend validation for amount
    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be a positive number." })
    }
    // Backend validation for date
    const payoutDate = new Date(date)
    const today = new Date()
    payoutDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    if (payoutDate > today) {
      return res.status(400).json({ success: false, message: "Date cannot be in the future." })
    }
    const payout = await Payout.create({
      canteen: canteenId,
      admin: adminId,
      trnId,
      date,
      amount,
      notes,
    })
    res.status(201).json({ success: true, message: "Payout recorded successfully", payout })
  } catch (error) {
    console.error("Error creating payout:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
}

// Get all payouts (admin view)
exports.getPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find().populate("canteen", "name").populate("admin", "name email").sort({ date: -1 })
    res.status(200).json({ success: true, payouts })
  } catch (error) {
    console.error("Error fetching payouts:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
}

// Get payouts for a specific canteen (vendor detail view)
exports.getPayoutsByCanteen = async (req, res) => {
  try {
    const { canteenId } = req.params
    const payouts = await Payout.find({ canteen: canteenId }).populate("admin", "name email").sort({ date: -1 })
    res.status(200).json({ success: true, payouts })
  } catch (error) {
    console.error("Error fetching payouts by canteen:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};



exports.getSuspectedUser=async(req,res)=>{
  try{
      const AllSuspectedUser= await User.find({role:"student",
        $or: [
          { "securityEvents.type": "suspicious_login" },
          { suspiciousActivityCount: { $gt: 0 } }
        ]
      });
      if(AllSuspectedUser.length===0){
        return res.status(400).json({
          success:false,
          message:"No suspected User"
        })
      }
      const penalties=await Penalty.find({isPaid:false}).populate({path:"user",select:"email"}).populate({path:"Order",select:"OrderNumber"}).select("student Amount deviceId  isPaid")
      const UsersWithPenalty = [];

      for (const user of AllSuspectedUser) {
      const userObj = user.toObject();

      // Check if any deviceId matches with any unpaid penalty
      const matchingPenalty = penalties.find(penalty => {
        return userObj.devices?.some(device => device.deviceId === penalty.deviceId);
      });

      if (matchingPenalty) {
        UsersWithPenalty.push({
          name:userObj.name,
          email:userObj.email,
          suspiciousCount:userObj.suspiciousActivityCount,
          penalty:matchingPenalty
        });
      }
    }
      
      if(UsersWithPenalty.length===0){
        return res.status(400).json({
          success:false,
          message:"No suspected User"
        })
      }

      return res.status(200).json({
        success:true,
        data:UsersWithPenalty
      })
  }
  catch(err){
    
    return res.status(500).json({
      success:false,
      message:"internal server error",
      error:err.message
    })
  }
}