const PayoutRequest = require("../models/PayoutRequest")
const BankDetails = require("../models/BankDetails")
const Canteen = require("../models/Canteen")
const Order = require("../models/Order")
const Transaction = require("../models/Transaction")

// Get vendor's current balance and earnings
exports.getBalance = async (req, res) => {
  try {
    const userId = req.user._id

    // Find canteen owned by user
    const canteen = await Canteen.findOne({
      owner: userId,
      isDeleted: false,
    })

    if (!canteen) {
      return res.status(404).json({
        success: false,
        message: "No canteen found for this vendor",
      })
    }

    // Calculate total earnings from completed orders
    const earningsData = await Order.aggregate([
      {
        $match: {
          canteen: canteen._id,
          status: "completed",
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$total" },
          totalOrders: { $sum: 1 },
        },
      },
    ])

    const totalEarnings = earningsData[0]?.totalEarnings || 0
    const totalOrders = earningsData[0]?.totalOrders || 0

    // Calculate total payouts made
    const payoutData = await PayoutRequest.aggregate([
      {
        $match: {
          canteen: canteen._id,
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalPayouts: { $sum: "$requestedAmount" },
          payoutCount: { $sum: 1 },
        },
      },
    ])

    const totalPayouts = payoutData[0]?.totalPayouts || 0
    const payoutCount = payoutData[0]?.payoutCount || 0

    // Calculate available balance (earnings - payouts - platform fee)
    const platformFeeRate = 0.05 // 5% platform fee
    const platformFee = totalEarnings * platformFeeRate
    const availableBalance = Math.max(0, totalEarnings - totalPayouts - platformFee)

    // Update canteen balance
    await Canteen.findByIdAndUpdate(canteen._id, {
      totalEarnings,
      availableBalance,
      totalPayouts,
    })

    // Get pending payout requests
    const pendingPayouts = await PayoutRequest.find({
      canteen: canteen._id,
      status: { $in: ["pending", "approved", "processing"] },
    }).sort({ createdAt: -1 })

    const pendingAmount = pendingPayouts.reduce((sum, payout) => sum + payout.requestedAmount, 0)

    res.status(200).json({
      success: true,
      message: "Balance information retrieved successfully",
      data: {
        canteen: {
          id: canteen._id,
          name: canteen.name,
        },
        balance: {
          totalEarnings,
          totalPayouts,
          platformFee: Math.round(platformFee * 100) / 100,
          availableBalance: Math.round(availableBalance * 100) / 100,
          pendingPayouts: pendingAmount,
        },
        statistics: {
          totalOrders,
          completedPayouts: payoutCount,
          pendingPayoutRequests: pendingPayouts.length,
        },
        pendingRequests: pendingPayouts.map((p) => ({
          id: p._id,
          amount: p.requestedAmount,
          status: p.status,
          requestedAt: p.createdAt,
        })),
      },
    })
  } catch (error) {
    console.error("Get balance error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve balance information",
      error: error.message,
    })
  }
}

// Request payout
exports.requestPayout = async (req, res) => {
  try {
    const { requestedAmount, notes } = req.body
    const userId = req.user._id

    // Validate amount
    if (!requestedAmount || requestedAmount < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum payout amount is ₹100",
      })
    }

    if (requestedAmount > 100000) {
      return res.status(400).json({
        success: false,
        message: "Maximum payout amount is ₹1,00,000 per request",
      })
    }

    // Find canteen owned by user
    const canteen = await Canteen.findOne({
      owner: userId,
      isDeleted: false,
    })

    if (!canteen) {
      return res.status(404).json({
        success: false,
        message: "No canteen found for this vendor",
      })
    }

    // Check if canteen is approved
    if (!canteen.isApproved || canteen.approvalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your canteen must be approved before requesting payouts",
      })
    }

    // Check if bank details exist and are verified
    const bankDetails = await BankDetails.findOne({
      canteen: canteen._id,
      isDeleted: false,
      isActive: true,
    })

    if (!bankDetails) {
      return res.status(400).json({
        success: false,
        message: "Please add your bank details before requesting payouts",
      })
    }

    if (!bankDetails.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Your bank details must be verified by admin before requesting payouts",
      })
    }

    // Calculate current available balance
    const earningsData = await Order.aggregate([
      {
        $match: {
          canteen: canteen._id,
          status: "completed",
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$total" },
        },
      },
    ])

    const totalEarnings = earningsData[0]?.totalEarnings || 0

    const payoutData = await PayoutRequest.aggregate([
      {
        $match: {
          canteen: canteen._id,
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalPayouts: { $sum: "$requestedAmount" },
        },
      },
    ])

    const totalPayouts = payoutData[0]?.totalPayouts || 0
    const platformFee = totalEarnings * 0.05 // 5% platform fee
    const availableBalance = Math.max(0, totalEarnings - totalPayouts - platformFee)

    // Check if sufficient balance
    if (requestedAmount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ₹${Math.round(availableBalance * 100) / 100}`,
        availableBalance: Math.round(availableBalance * 100) / 100,
      })
    }

    // Check for pending requests
    const pendingRequest = await PayoutRequest.findOne({
      canteen: canteen._id,
      status: { $in: ["pending", "approved", "processing"] },
    })

    if (pendingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending payout request. Please wait for it to be processed.",
        pendingRequest: {
          id: pendingRequest._id,
          amount: pendingRequest.requestedAmount,
          status: pendingRequest.status,
          requestedAt: pendingRequest.createdAt,
        },
      })
    }

    // Create payout request
    const payoutRequest = await PayoutRequest.create({
      canteen: canteen._id,
      vendor: userId,
      requestedAmount,
      availableBalance,
      requestNotes: notes,
      bankDetails: {
        accountHolderName: bankDetails.accountHolderName,
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        bankName: bankDetails.bankName,
        branchName: bankDetails.branchName,
        upiId: bankDetails.upiId,
      },
    })

    res.status(201).json({
      success: true,
      message: "Payout request submitted successfully",
      data: {
        requestId: payoutRequest._id,
        requestedAmount: payoutRequest.requestedAmount,
        status: payoutRequest.status,
        requestedAt: payoutRequest.createdAt,
        estimatedProcessingTime: "2-3 business days",
      },
    })
  } catch (error) {
    console.error("Request payout error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to submit payout request",
      error: error.message,
    })
  }
}

// Get payout history for vendor
exports.getPayoutHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const userId = req.user._id

    // Find canteen owned by user
    const canteen = await Canteen.findOne({
      owner: userId,
      isDeleted: false,
    })

    if (!canteen) {
      return res.status(404).json({
        success: false,
        message: "No canteen found for this vendor",
      })
    }

    const filter = { canteen: canteen._id, isDeleted: false }
    if (status) {
      filter.status = status
    }

    const skip = (page - 1) * limit

    const payoutRequests = await PayoutRequest.find(filter)
      .populate("reviewedBy", "name email")
      .populate("processedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const total = await PayoutRequest.countDocuments(filter)

    // Calculate summary statistics
    const summaryData = await PayoutRequest.aggregate([
      { $match: { canteen: canteen._id, isDeleted: false } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$requestedAmount" },
        },
      },
    ])

    const summary = {
      total: 0,
      completed: 0,
      pending: 0,
      rejected: 0,
      totalAmount: 0,
      completedAmount: 0,
    }

    summaryData.forEach((item) => {
      summary.total += item.count
      summary.totalAmount += item.totalAmount

      if (item._id === "completed") {
        summary.completed = item.count
        summary.completedAmount = item.totalAmount
      } else if (["pending", "approved", "processing"].includes(item._id)) {
        summary.pending += item.count
      } else if (["rejected", "failed"].includes(item._id)) {
        summary.rejected += item.count
      }
    })

    res.status(200).json({
      success: true,
      message: "Payout history retrieved successfully",
      data: payoutRequests,
      summary,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get payout history error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payout history",
      error: error.message,
    })
  }
}

// Get specific payout request status
exports.getPayoutStatus = async (req, res) => {
  try {
    const { requestId } = req.params
    const userId = req.user._id

    // Find canteen owned by user
    const canteen = await Canteen.findOne({
      owner: userId,
      isDeleted: false,
    })

    if (!canteen) {
      return res.status(404).json({
        success: false,
        message: "No canteen found for this vendor",
      })
    }

    const payoutRequest = await PayoutRequest.findOne({
      _id: requestId,
      canteen: canteen._id,
      isDeleted: false,
    })
      .populate("reviewedBy", "name email")
      .populate("processedBy", "name email")

    if (!payoutRequest) {
      return res.status(404).json({
        success: false,
        message: "Payout request not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Payout request status retrieved successfully",
      data: payoutRequest,
    })
  } catch (error) {
    console.error("Get payout status error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payout status",
      error: error.message,
    })
  }
}

// Admin: Get all payout requests
exports.getAllPayoutRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, canteenId } = req.query

    const filter = { isDeleted: false }
    if (status) filter.status = status
    if (canteenId) filter.canteen = canteenId

    const skip = (page - 1) * limit

    const payoutRequests = await PayoutRequest.find(filter)
      .populate("canteen", "name contactPersonName")
      .populate("vendor", "name email")
      .populate("reviewedBy", "name email")
      .populate("processedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const total = await PayoutRequest.countDocuments(filter)

    res.status(200).json({
      success: true,
      message: "Payout requests retrieved successfully",
      data: payoutRequests,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get all payout requests error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payout requests",
      error: error.message,
    })
  }
}

// Admin: Review payout request
exports.reviewPayoutRequest = async (req, res) => {
  try {
    const { requestId } = req.params
    const { action, notes } = req.body // action: "approve" or "reject"
    const adminId = req.user._id

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use 'approve' or 'reject'",
      })
    }

    const payoutRequest = await PayoutRequest.findById(requestId)
      .populate("canteen", "name")
      .populate("vendor", "name email")

    if (!payoutRequest) {
      return res.status(404).json({
        success: false,
        message: "Payout request not found",
      })
    }

    if (payoutRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Payout request is already ${payoutRequest.status}`,
      })
    }

    payoutRequest.status = action === "approve" ? "approved" : "rejected"
    payoutRequest.reviewedBy = adminId
    payoutRequest.reviewedAt = new Date()
    payoutRequest.adminNotes = notes || ""

    if (action === "reject") {
      payoutRequest.rejectionReason = notes || "Request rejected by admin"
    }

    await payoutRequest.save()

    res.status(200).json({
      success: true,
      message: `Payout request ${action}d successfully`,
      data: {
        requestId: payoutRequest._id,
        canteenName: payoutRequest.canteen.name,
        vendorName: payoutRequest.vendor.name,
        amount: payoutRequest.requestedAmount,
        status: payoutRequest.status,
        reviewedAt: payoutRequest.reviewedAt,
      },
    })
  } catch (error) {
    console.error("Review payout request error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to review payout request",
      error: error.message,
    })
  }
}

// Admin: Process approved payout
exports.processPayout = async (req, res) => {
  try {
    const { requestId } = req.params
    const { transactionId, notes } = req.body
    const adminId = req.user._id

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      })
    }

    const payoutRequest = await PayoutRequest.findById(requestId)
      .populate("canteen", "name")
      .populate("vendor", "name email")

    if (!payoutRequest) {
      return res.status(404).json({
        success: false,
        message: "Payout request not found",
      })
    }

    if (payoutRequest.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: `Payout request must be approved first. Current status: ${payoutRequest.status}`,
      })
    }

    payoutRequest.status = "completed"
    payoutRequest.processedBy = adminId
    payoutRequest.processedAt = new Date()
    payoutRequest.transactionId = transactionId
    payoutRequest.adminNotes = (payoutRequest.adminNotes || "") + "\n" + (notes || "")

    await payoutRequest.save()

    // Update canteen payout totals
    await Canteen.findByIdAndUpdate(payoutRequest.canteen._id, {
      $inc: { totalPayouts: payoutRequest.requestedAmount },
    })

    res.status(200).json({
      success: true,
      message: "Payout processed successfully",
      data: {
        requestId: payoutRequest._id,
        canteenName: payoutRequest.canteen.name,
        vendorName: payoutRequest.vendor.name,
        amount: payoutRequest.requestedAmount,
        transactionId: payoutRequest.transactionId,
        processedAt: payoutRequest.processedAt,
      },
    })
  } catch (error) {
    console.error("Process payout error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to process payout",
      error: error.message,
    })
  }
}
