const mongoose = require("mongoose");
const Canteen = require("../models/Canteen");
const Order = require("../models/Order");
const Item = require("../models/Item");

const startOfDay = (date) => new Date(date.setHours(0,0,0,0));
const endOfDay = (date) => new Date(date.setHours(23,59,59,999));

async function verifyVendorAccess(req, res, next) {
  try {
    const { canteenId } = req.params;
    const vendorId = req.user._id;

    const canteen = await Canteen.findById(canteenId);
    if (!canteen) return res.status(404).json({ message: "Canteen not found" });
    if (canteen.owner.toString() !== vendorId.toString()) {
      return res.status(403).json({ message: "Forbidden: not your canteen" });
    }

    req.canteen = canteen;
    next();
  } catch (err) {
    console.error("Vendor access check error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * Basic Dashboard Info
 * - Total orders placed (all time)
 * - Total earnings & payouts (from Canteen fields)
 * - Number of active items
 * - Average rating (adminRatings)
 */
exports.getBasicDashboard = async (req, res) => {
  try {
    const { canteenId } = req.params;

    const canteen = await Canteen.findById(canteenId)
      .select("totalEarnings totalPayouts availableBalance adminRatings items")
      .populate({ path: "items", match: { isDeleted: false, available: true } });

    if (!canteen) return res.status(404).json({ message: "Canteen not found" });

    const totalOrders = await Order.countDocuments({
      canteen: canteen._id,
      isDeleted: false,
    });

    const activeItems = canteen.items ? canteen.items.length : 0;

    // Compute average rating
    let avgRating = 0;
    if (canteen.adminRatings && canteen.adminRatings.length > 0) {
      const totalRating = canteen.adminRatings.reduce((sum, r) => sum + r.rating, 0);
      avgRating = totalRating / canteen.adminRatings.length;
    }

    return res.json({
      success: true,
      data: {
        totalOrders,
        totalEarnings: canteen.totalEarnings,
        totalPayouts: canteen.totalPayouts,
        availableBalance: canteen.availableBalance,
        activeItems,
        averageRating: avgRating.toFixed(2),
      }
    });
  } catch (err) {
    console.error("Basic Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Financial Overview
 * - Earnings and payouts over time (last 30 days)
 * - Daily sales totals
 * - Pending payouts
 */
exports.getFinancialOverview = async (req, res) => {
  try {
    const { canteenId } = req.params;

    // Confirm ownership first or add middleware for verifyVendorAccess

    // Aggregate Orders for last 30 days to calculate daily totals
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await Order.aggregate([
      {
        $match: {
          canteen: mongoose.Types.ObjectId(canteenId),
          createdAt: { $gte: thirtyDaysAgo },
          status: { $in: ["completed", "ready", "placed"]}, // consider only completed or relevant orders
          isDeleted: false,
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          dailyTotal: { $sum: "$total" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    const canteen = await Canteen.findById(canteenId).select("totalEarnings totalPayouts availableBalance");

    return res.json({
      success: true,
      data: {
        totalEarnings: canteen.totalEarnings,
        totalPayouts: canteen.totalPayouts,
        availableBalance: canteen.availableBalance,
        salesData
      }
    });
  } catch (err) {
    console.error("Financial overview error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Order Performance
 * - Status counts (pending, preparing, completed, cancelled)
 * - Average order completion time
 * - Orders by time/day (hourly distribution)
 */
exports.getOrderPerformance = async (req, res) => {
  try {
    const { canteenId } = req.params;

    // Aggregate orders for status counts
    const counts = await Order.aggregate([
      { $match: { canteen: mongoose.Types.ObjectId(canteenId), isDeleted: false } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Map status counts to an object:
    const statusCounts = counts.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    // Calculate average completion time (from placed to completed)
    // Only consider completed orders
    const avgTimeResult = await Order.aggregate([
      {
        $match: {
          canteen: mongoose.Types.ObjectId(canteenId),
          status: "completed",
          isDeleted: false,
          createdAt: { $exists: true },
          updatedAt: { $exists: true }
        }
      },
      {
        $project: {
          durationMinutes: {
            $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 1000 * 60]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$durationMinutes" }
        }
      }
    ]);

    const avgCompletionTime = avgTimeResult.length > 0 ? avgTimeResult[0].avgDuration : 0;

    // Orders by hour histogram (group orders by hour of createdAt)
    const ordersByHour = await Order.aggregate([
      {
        $match: { canteen: mongoose.Types.ObjectId(canteenId), isDeleted: false }
      },
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
      {
        $sort: { _id: 1 }
      }
    ]);

    return res.json({
      success: true,
      data: {
        statusCounts,
        averageCompletionTimeMinutes: avgCompletionTime.toFixed(2),
        ordersByHour
      }
    });
  } catch (err) {
    console.error("Order performance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Item Sales Analysis
 * - Sales per item (total units sold and revenue)
 * - Percentage contribution to total sales
 * - Top 5 best-selling items
 */
exports.getItemSalesAnalysis = async (req, res) => {
  try {
    const { canteenId } = req.params;

    // Aggregate all items in orders for this canteen
    const itemStats = await Order.aggregate([
      { $match: { canteen: mongoose.Types.ObjectId(canteenId), isDeleted: false } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.item", // item ObjectId
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.priceAtPurchase"] } }
        }
      },
      {
        $lookup: {
          from: "items",
          localField: "_id",
          foreignField: "_id",
          as: "itemInfo"
        }
      },
      { $unwind: "$itemInfo" },
      {
        $project: {
          itemId: "$_id",
          name: "$itemInfo.name",
          totalQuantity: 1,
          totalRevenue: 1,
        }
      },
      {
        $sort: { totalQuantity: -1 }
      }
    ]);

    const totalUnitsSold = itemStats.reduce((sum, item) => sum + item.totalQuantity, 0);

    // Calculate percentage contribution per item
    const statsWithPercentages = itemStats.map(item => ({
      ...item,
      salesPercentage: totalUnitsSold > 0 ? ((item.totalQuantity / totalUnitsSold) * 100).toFixed(2) : "0.00"
    }));

    // Top 5 best sellers
    const top5Items = statsWithPercentages.slice(0, 5);

    return res.json({
      success: true,
      data: { allItems: statsWithPercentages, top5Items },
    });
  } catch (err) {
    console.error("Item sales analysis error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Operating Metrics
 * - Active days of week by order volume
 * - Operating hours utilization: number of orders by time ranges between opening and closing
 */
exports.getOperatingMetrics = async (req, res) => {
  try {
    const { canteenId } = req.params;

    const canteen = await Canteen.findById(canteenId).select("operatingHours operatingDays");

    if (!canteen) return res.status(404).json({ message: "Canteen not found" });

    const open = canteen.operatingHours.opening; // e.g. "09:00"
    const close = canteen.operatingHours.closing; // e.g. "21:00"

    // Orders grouped by day name of week
    const ordersByDay = await Order.aggregate([
      { $match: { canteen: mongoose.Types.ObjectId(canteenId), isDeleted: false } },
      {
        $project: {
          dayOfWeek: { $dayOfWeek: "$createdAt" } // Sunday=1, Monday=2...
        }
      },
      {
        $group: {
          _id: "$dayOfWeek",
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert numeric dayOfWeek to strings for clarity:
    const dayNames = [null, "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const daysData = {};
    for (const day of ordersByDay) {
      daysData[dayNames[day._id]] = day.count;
    }

    // Orders grouped by hour to estimate utilization
    const ordersByHour = await Order.aggregate([
      { $match: { canteen: mongoose.Types.ObjectId(canteenId), isDeleted: false } },
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

    return res.json({
      success: true,
      data: {
        operatingDays: canteen.operatingDays,
        ordersByDay: daysData,
        ordersByHour,
        operatingHours: { opening: open, closing: close }
      }
    });
  } catch (err) {
    console.error("Operating metrics error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
