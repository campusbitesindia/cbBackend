const User = require('../models/User');
const Campus = require('../models/Campus');
const Canteen = require('../models/Canteen');
const Transaction = require("../models/Transaction");

exports.getTotalCounts = async (req, res) => {
  try {
    const [userCount, campusCount, canteenCount] = await Promise.all([
      User.countDocuments(),
      Campus.countDocuments(),
      Canteen.countDocuments()
    ]);

    res.status(200).json({
      totalUsers: userCount,
      totalCampuses: campusCount,
      totalCanteens: canteenCount
    });
  } catch (error) {
    console.error('Error getting total counts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMonthlyUserCount = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(users);
  } catch (error) {
    console.error("Error getting monthly user count:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserCountByRole = async (req, res) => {
  try {
    const roles = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    res.json(roles);
  } catch (error) {d
    console.error("Error getting user count by role:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const mongoose = require('mongoose');
const Order = require('../models/Order');

exports.getTopUsersBySpending = async (req, res) => {
  try {
    const topUsers = await Order.aggregate([
      {
        $match: {
          status: { $in: ["completed", "placed"] }       
        }
      },
      {
        $group: {
          _id: "$student", 
          totalSpent: { $sum: "$total" }
        }
      },
      { $sort: { totalSpent: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          name: "$userInfo.name",
          email: "$userInfo.email",
          totalSpent: 1
        }
      }
    ]);
    console.log(topUsers);
    res.json(topUsers);
  } catch (error) {
    console.error("Error getting top users by spending:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUsersByRoleList = async (req, res) => {
  try {
    const [students, owners] = await Promise.all([
      User.find({ role: "student" }).select("name email"),
      User.find({ role: "canteen" }).select("name email")
    ]);
    res.json({ students, canteenOwners: owners });
  } catch (error) {
    console.error("Error getting users by role list:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMonthlyOrders = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
                format: "%Y-%m",
                date: { $ifNull: ["$createdAt", "$placedAt"] }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(data);
  } catch (error) {
    console.error("Monthly orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOrdersByCampusCanteen = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: "canteens",
          localField: "canteen",
          foreignField: "_id",
          as: "canteenInfo"
        }
      },
      { $unwind: "$canteenInfo" },
      {
        $lookup: {
          from: "campus",
          localField: "canteenInfo.campus",
          foreignField: "_id",
          as: "campusInfo"
        }
      },
      { $unwind: "$campusInfo" },
      {
        $group: {
          _id: {
            campusId: "$campusInfo._id",
            campusName: "$campusInfo.name",
            canteenId: "$canteenInfo._id",
            canteenName: "$canteenInfo.name"
          },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          campusId: "$_id.campusId",
          campusName: "$_id.campusName",
          canteenId: "$_id.canteenId",
          canteenName: "$_id.canteenName",
          totalOrders: 1
        }
      },
      {
        $sort: {
          totalOrders: -1
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    console.error("Orders by campus/canteen error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOrderStatusBreakdown = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(data);
  } catch (error) {
    console.error("Order status breakdown error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTopCanteensByOrderVolume = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: "$canteen",
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "canteens",
          localField: "_id",
          foreignField: "_id",
          as: "canteenInfo"
        }
      },
      { $unwind: "$canteenInfo" },
      {
        $project: {
          name: "$canteenInfo.name",
          campus: "$canteenInfo.campus",
          totalOrders: 1
        }
      }
    ]);
    res.json(data);
  } catch (error) {
    console.error("Top canteens error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAverageOrderValue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: null,
          averageValue: { $avg: "$total" }
        }
      }
    ]);
    res.json({ averageOrderValue: result[0]?.averageValue || 0 });
  } catch (error) {
    console.error("Average order value error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPeakOrderTimes = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $project: {
          hour: { $hour: "$createdAt" }
        }
      },
      {
        $group: {
          _id: "$hour",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(data);
  } catch (error) {
    console.error("Peak order time error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTotalRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    res.json({ totalRevenue: result[0]?.total || 0 });
  } catch (error) {
    console.error("Total revenue error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRevenueByCampusAndCanteen = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $lookup: {
          from: "canteens",
          localField: "canteen",
          foreignField: "_id",
          as: "canteenInfo"
        }
      },
      { $unwind: "$canteenInfo" },
      {
        $lookup: {
          from: "campus",
          localField: "canteenInfo.campus",
          foreignField: "_id",
          as: "campusInfo"
        }
      },
      { $unwind: "$campusInfo" },
      {
        $group: {
          _id: {
            campusId: "$campusInfo._id",
            campusName: "$campusInfo.name",
            canteenId: "$canteenInfo._id",
            canteenName: "$canteenInfo.name"
          },
          revenue: { $sum: "$total" }
        }
      },
      {
        $project: {
          _id: 0,
          campusId: "$_id.campusId",
          campusName: "$_id.campusName",
          canteenId: "$_id.canteenId",
          canteenName: "$_id.canteenName",
          revenue: 1
        }
      },
      {
        $sort: {
          campusName: 1,
          canteenName: 1
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    console.error("Revenue by campus/canteen error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTopCanteensByRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: "$canteen",
          totalRevenue: { $sum: "$total" }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "canteens",
          localField: "_id",
          foreignField: "_id",
          as: "canteen"
        }
      },
      { $unwind: "$canteen" },
      {
        $project: {
          name: "$canteen.name",
          campus: "$canteen.campus",
          totalRevenue: 1
        }
      }
    ]);
    res.json(result);
  } catch (error) {
    console.error("Top canteens by revenue error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTopCampusesByRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $lookup: {
          from: "canteens",
          localField: "canteen",
          foreignField: "_id",
          as: "canteenInfo"
        }
      },
      { $unwind: "$canteenInfo" },
      {
        $lookup: {
          from: "campus", 
          localField: "canteenInfo.campus",
          foreignField: "_id",
          as: "campusInfo"
        }
      },
      { $unwind: "$campusInfo" },
      {
        $group: {
          _id: {
            campusId: "$campusInfo._id",
            campusName: "$campusInfo.name"
          },
          totalRevenue: { $sum: "$total" }
        }
      },
      {
        $project: {
          _id: 0,
          campusId: "$_id.campusId",
          campusName: "$_id.campusName",
          totalRevenue: 1
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    res.json(result);
  } catch (error) {
    console.error("Top campuses error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRevenueByPaymentMethod = async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      {
        $match: {
          isDeleted: false,
          status: "paid"
        }
      },
      {
        $group: {
          _id: "$mode",
          totalRevenue: { $sum: "$amount" }
        }
      },
      {
        $project: {
          _id: 0,
          paymentMethod: "$_id",
          totalRevenue: 1
        }
      }
    ]);

    res.json(result);
  } catch (error) {
    console.error("Payment method breakdown error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDailyRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: { $ifNull: ["$createdAt", "$placedAt"] }}},
          revenue: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(result);
  } catch (error) {
    console.error("Daily revenue error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getWeeklyRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%U", date: { $ifNull: ["$createdAt", "$placedAt"] } } }, 
          revenue: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(result);
  } catch (error) {
    console.error("Weekly revenue error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMonthlyRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: { $ifNull: ["$createdAt", "$placedAt"] } } },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(result);
  } catch (error) {
    console.error("Monthly revenue error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(userId, { isBanned: true });
    res.json({ message: "User has been banned." });
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.suspendCanteen = async (req, res) => {
  try {
    const { canteenId } = req.body;
    const canteen = await Canteen.findByIdAndUpdate(canteenId, { isSuspended: true }, { new: true });
    if (canteen?.owner) {
      await User.findByIdAndUpdate(canteen.owner, { isBanned: true });
    }
    res.json({ message: "Canteen suspended and owner banned." });
  } catch (error) {
    console.error("Error suspending canteen:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.adminRateVendor = async (req, res) => {
  try {
    const { canteenId, rating, feedback } = req.body;

    const canteen = await Canteen.findById(canteenId);
    if (!canteen) return res.status(404).json({ message: "Canteen not found" });

    canteen.adminRatings = canteen.adminRatings || [];
    canteen.adminRatings.push({ rating, feedback, date: new Date() });
    await canteen.save();

    res.json({ message: "Admin rating submitted." });
  } catch (error) {
    console.error("Error rating vendor:", error);
    res.status(500).json({ message: "Server error" });
  }
};
