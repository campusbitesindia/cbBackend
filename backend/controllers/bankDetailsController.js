const BankDetails = require("../models/BankDetails")
const Canteen = require("../models/Canteen")

// Get vendor's bank details
exports.getBankDetails = async (req, res) => {
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

    // Find bank details
    const bankDetails = await BankDetails.findOne({
      canteen: canteen._id,
      isDeleted: false,
    }).populate("verifiedBy", "name email")

    if (!bankDetails) {
      return res.status(404).json({
        success: false,
        message: "No bank details found. Please add your bank details to receive payouts.",
        canteenId: canteen._id,
      })
    }

    // Remove sensitive data for response
    const safeDetails = {
      _id: bankDetails._id,
      accountHolderName: bankDetails.accountHolderName,
      accountNumber: `****${bankDetails.accountNumber.slice(-4)}`, // Mask account number
      ifscCode: bankDetails.ifscCode,
      bankName: bankDetails.bankName,
      branchName: bankDetails.branchName,
      upiId: bankDetails.upiId,
      isVerified: bankDetails.isVerified,
      verifiedAt: bankDetails.verifiedAt,
      verifiedBy: bankDetails.verifiedBy,
      verificationNotes: bankDetails.verificationNotes,
      isActive: bankDetails.isActive,
      createdAt: bankDetails.createdAt,
      updatedAt: bankDetails.updatedAt,
    }

    res.status(200).json({
      success: true,
      message: "Bank details retrieved successfully",
      data: safeDetails,
      canteen: {
        id: canteen._id,
        name: canteen.name,
      },
    })
  } catch (error) {
    console.error("Get bank details error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve bank details",
      error: error.message,
    })
  }
}

// Add or update bank details
exports.updateBankDetails = async (req, res) => {
  try {
    const { accountHolderName, accountNumber, confirmAccountNumber, ifscCode, bankName, branchName, upiId } = req.body
    const userId = req.user._id

    // Validate required fields
    if (!accountHolderName || !accountNumber || !confirmAccountNumber || !ifscCode || !bankName || !branchName) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
        required: ["accountHolderName", "accountNumber", "confirmAccountNumber", "ifscCode", "bankName", "branchName"],
      })
    }

    // Validate account number confirmation
    if (accountNumber !== confirmAccountNumber) {
      return res.status(400).json({
        success: false,
        message: "Account numbers do not match",
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

    // Check if bank details already exist
    let bankDetails = await BankDetails.findOne({
      canteen: canteen._id,
      isDeleted: false,
    })

    const bankData = {
      canteen: canteen._id,
      owner: userId,
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.trim(),
      confirmAccountNumber: confirmAccountNumber.trim(),
      ifscCode: ifscCode.toUpperCase().trim(),
      bankName: bankName.trim(),
      branchName: branchName.trim(),
      upiId: upiId ? upiId.trim() : undefined,
      isVerified: false, // Reset verification on update
      verifiedBy: null,
      verifiedAt: null,
      verificationNotes: null,
    }

    if (bankDetails) {
      // Update existing bank details
      Object.assign(bankDetails, bankData)
      await bankDetails.save()
    } else {
      // Create new bank details
      bankDetails = await BankDetails.create(bankData)
    }

    // Return safe response without sensitive data
    const safeDetails = {
      _id: bankDetails._id,
      accountHolderName: bankDetails.accountHolderName,
      accountNumber: `****${bankDetails.accountNumber.slice(-4)}`,
      ifscCode: bankDetails.ifscCode,
      bankName: bankDetails.bankName,
      branchName: bankDetails.branchName,
      upiId: bankDetails.upiId,
      isVerified: bankDetails.isVerified,
      isActive: bankDetails.isActive,
      createdAt: bankDetails.createdAt,
      updatedAt: bankDetails.updatedAt,
    }

    res.status(200).json({
      success: true,
      message: bankDetails.isNew ? "Bank details added successfully" : "Bank details updated successfully",
      data: safeDetails,
      note: "Bank details will be verified by admin before payouts can be processed",
    })
  } catch (error) {
    console.error("Update bank details error:", error)

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to update bank details",
      error: error.message,
    })
  }
}

// Admin: Get all bank details for verification
exports.getAllBankDetails = async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 20 } = req.query

    const filter = { isDeleted: false }
    if (status === "pending") {
      filter.isVerified = false
    } else if (status === "verified") {
      filter.isVerified = true
    }

    const skip = (page - 1) * limit

    const bankDetails = await BankDetails.find(filter)
      .populate("canteen", "name contactPersonName")
      .populate("owner", "name email")
      .populate("verifiedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const total = await BankDetails.countDocuments(filter)

    res.status(200).json({
      success: true,
      message: "Bank details retrieved successfully",
      data: bankDetails,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get all bank details error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve bank details",
      error: error.message,
    })
  }
}

// Admin: Verify bank details
exports.verifyBankDetails = async (req, res) => {
  try {
    const { bankDetailsId } = req.params
    const { verified, notes } = req.body
    const adminId = req.user._id

    if (typeof verified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Please specify whether to verify (true) or reject (false)",
      })
    }

    const bankDetails = await BankDetails.findById(bankDetailsId)
      .populate("canteen", "name")
      .populate("owner", "name email")

    if (!bankDetails) {
      return res.status(404).json({
        success: false,
        message: "Bank details not found",
      })
    }

    bankDetails.isVerified = verified
    bankDetails.verifiedBy = adminId
    bankDetails.verifiedAt = new Date()
    bankDetails.verificationNotes = notes || ""

    await bankDetails.save()

    res.status(200).json({
      success: true,
      message: `Bank details ${verified ? "verified" : "rejected"} successfully`,
      data: {
        bankDetailsId: bankDetails._id,
        canteenName: bankDetails.canteen.name,
        ownerName: bankDetails.owner.name,
        ownerEmail: bankDetails.owner.email,
        isVerified: bankDetails.isVerified,
        verifiedAt: bankDetails.verifiedAt,
        verificationNotes: bankDetails.verificationNotes,
      },
    })
  } catch (error) {
    console.error("Verify bank details error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to verify bank details",
      error: error.message,
    })
  }
}

// Delete bank details
exports.deleteBankDetails = async (req, res) => {
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

    const bankDetails = await BankDetails.findOne({
      canteen: canteen._id,
      isDeleted: false,
    })

    if (!bankDetails) {
      return res.status(404).json({
        success: false,
        message: "No bank details found to delete",
      })
    }

    bankDetails.isDeleted = true
    bankDetails.isActive = false
    await bankDetails.save()

    res.status(200).json({
      success: true,
      message: "Bank details deleted successfully",
    })
  } catch (error) {
    console.error("Delete bank details error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete bank details",
      error: error.message,
    })
  }
}
