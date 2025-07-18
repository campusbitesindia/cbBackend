const Canteen = require("../models/Canteen")
const cloudinary = require("../utils/cloudinary")

// Create Canteen with image support and business details
exports.createCanteen = async (req, res) => {
  try {
    const { name, campus, adhaarNumber, panNumber, gstNumber, contactPersonName, contactPhone, description } = req.body
    const userRole = req.user.role

    // Only canteen owners can create canteens
    if (userRole !== "canteen") {
      return res.status(403).json({
        success: false,
        message: "Only canteen owners can create canteens",
      })
    }

    // Validate required fields
    if (!name || !campus || !adhaarNumber || !panNumber || !gstNumber || !contactPersonName) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
        required: ["name", "campus", "adhaarNumber", "panNumber", "gstNumber", "contactPersonName"],
      })
    }

    // Verify that the campus exists and is not deleted
    const Campus = require("../models/Campus")
    const campusDoc = await Campus.findOne({ _id: campus, isDeleted: false })
    if (!campusDoc) {
      return res.status(400).json({
        success: false,
        message: "Selected campus not found or is inactive. Please request campus creation if it doesn't exist.",
      })
    }

    // Check if user already has a canteen
    const existingCanteen = await Canteen.findOne({
      owner: req.user._id,
      isDeleted: false,
    })
    if (existingCanteen) {
      return res.status(400).json({
        success: false,
        message: "You already have a canteen. Each vendor can only have one canteen.",
      })
    }

    // Check for duplicate business details
    const duplicateAdhaar = await Canteen.findOne({ adhaarNumber, isDeleted: false })
    if (duplicateAdhaar) {
      return res.status(400).json({
        success: false,
        message: "Adhaar number is already registered with another canteen",
      })
    }

    const duplicatePAN = await Canteen.findOne({ panNumber, isDeleted: false })
    if (duplicatePAN) {
      return res.status(400).json({
        success: false,
        message: "PAN number is already registered with another canteen",
      })
    }

    const duplicateGST = await Canteen.findOne({ gstNumber, isDeleted: false })
    if (duplicateGST) {
      return res.status(400).json({
        success: false,
        message: "GST number is already registered with another canteen",
      })
    }

    // Validate image requirements (min 1, max 3)
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least 1 image is required for canteen registration",
        requirements: {
          minImages: 1,
          maxImages: 3,
          currentImages: 0,
        },
      })
    }

    if (req.files.length > 3) {
      return res.status(400).json({
        success: false,
        message: "Maximum 3 images allowed for canteen",
        requirements: {
          minImages: 1,
          maxImages: 3,
          currentImages: req.files.length,
        },
      })
    }

    // Handle image uploads (required: min 1, max 3)
    let imageUrls = []
    try {
      const uploads = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "campus_bites/canteens",
            resource_type: "image",
            transformation: [
              { width: 800, height: 600, crop: "fill" },
              { quality: "auto", fetch_format: "auto" },
            ],
          }),
        ),
      )
      imageUrls = uploads.map((upload) => upload.secure_url)
    } catch (uploadError) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload images",
        error: uploadError.message,
      })
    }

    const newCanteen = await Canteen.create({
      name,
      campus: campusDoc._id,
      owner: req.user._id,
      images: imageUrls,
      adhaarNumber,
      panNumber,
      gstNumber,
      contactPersonName,
      contactPhone,
      description,
      isOpen: false, // Closed until approved
      isApproved: false,
      approvalStatus: "pending",
    })

    // Update user's canteenId
    const User = require("../models/User")
    await User.findByIdAndUpdate(req.user._id, { canteenId: newCanteen._id })

    res.status(201).json({
      success: true,
      message: "Canteen created successfully and is pending admin approval",
      canteen: {
        id: newCanteen._id,
        name: newCanteen.name,
        campus: campusDoc.name,
        images: imageUrls,
        approvalStatus: newCanteen.approvalStatus,
        imageCount: imageUrls.length,
        businessDetails: {
          adhaarNumber: newCanteen.adhaarNumber,
          panNumber: newCanteen.panNumber,
          gstNumber: newCanteen.gstNumber,
          contactPersonName: newCanteen.contactPersonName,
        },
      },
      nextSteps: [
        "Wait for admin approval",
        "Set up your bank details for payouts",
        "Once approved, you can start adding menu items",
        "Set up your canteen operating hours",
      ],
    })
  } catch (error) {
    console.error("Error in creating canteen:", error)

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
      message: "Internal server error",
      error: error.message,
    })
  }
}

exports.getAllCanteens = async (req, res) => {
  try {
    const { campus, includeUnapproved = false } = req.query

    // Filter: if campus is passed, filter by campus ID
    const filter = { isDeleted: false }

    // Only show approved canteens by default (unless admin requests otherwise)
    if (includeUnapproved !== "true") {
      filter.isApproved = true
      filter.approvalStatus = "approved"
    }

    if (campus) {
      filter.campus = campus // campus should be ObjectId
    }

    const canteens = await Canteen.find(filter)
      .populate("campus", "name code city")
      .populate("owner", "name email")
      .select("-__v")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      canteens,
      count: canteens.length,
      message:
        includeUnapproved === "true" ? "All canteens fetched (including unapproved)" : "Approved canteens fetched",
    })
  } catch (err) {
    console.error("Error fetching canteens:", err)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    })
  }
}

exports.deleteCanteen = async (req, res) => {
  try {
    const { id } = req.params
    const userRole = req.user.role

    // Only canteen owners can delete canteens
    if (userRole !== "canteen") {
      return res.status(403).json({
        success: false,
        message: "Only canteen owners can delete canteens",
      })
    }

    const canteen = await Canteen.findById(id)

    if (!canteen) {
      return res.status(404).json({
        success: false,
        message: "Canteen not found",
      })
    }

    // Ensure the user owns this canteen
    if (canteen.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own canteen",
      })
    }

    if (canteen.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Canteen already deleted",
      })
    }

    canteen.isDeleted = true
    await canteen.save()

    res.status(200).json({
      success: true,
      message: "Canteen soft-deleted successfully",
    })
  } catch (err) {
    console.error("Error deleting canteen:", err)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    })
  }
}

exports.updateCanteen = async (req, res) => {
  try {
    const { id } = req.params
    const { name, isOpen, clearImages } = req.body
    const userRole = req.user.role

    // Only canteen owners can update canteens
    if (userRole !== "canteen") {
      return res.status(403).json({
        success: false,
        message: "Only canteen owners can update canteens",
      })
    }

    const canteen = await Canteen.findById(id)
    if (!canteen || canteen.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Canteen not found",
      })
    }

    // Ensure the user owns this canteen
    if (canteen.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own canteen",
      })
    }

    let currentImageCount = canteen.images.length

    // Clear all images if requested
    if (clearImages === "true") {
      canteen.images = []
      currentImageCount = 0
    }

    // Handle uploaded images with validation
    if (req.files && req.files.length > 0) {
      // Check if new images exceed limit
      if (req.files.length > 3) {
        return res.status(400).json({
          success: false,
          message: "Maximum 3 images allowed for canteen",
          requirements: {
            minImages: 1,
            maxImages: 3,
            currentImages: req.files.length,
          },
        })
      }

      try {
        const uploadPromises = req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "campus_bites/canteens",
            transformation: [
              { width: 800, height: 600, crop: "fill" },
              { quality: "auto", fetch_format: "auto" },
            ],
          }),
        )
        const uploaded = await Promise.all(uploadPromises)
        canteen.images = uploaded.map((file) => file.secure_url)
        currentImageCount = canteen.images.length
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload images",
          error: uploadError.message,
        })
      }
    }

    // Validate minimum image requirement
    if (currentImageCount === 0) {
      return res.status(400).json({
        success: false,
        message: "At least 1 image is required for canteen",
        requirements: {
          minImages: 1,
          maxImages: 3,
          currentImages: currentImageCount,
        },
      })
    }

    if (name) canteen.name = name
    if (isOpen !== undefined) canteen.isOpen = isOpen

    await canteen.save()

    res.status(200).json({
      success: true,
      message: "Canteen updated successfully",
      canteen: {
        id: canteen._id,
        name: canteen.name,
        isOpen: canteen.isOpen,
        images: canteen.images,
        imageCount: canteen.images.length,
        approvalStatus: canteen.approvalStatus,
      },
    })
  } catch (error) {
    console.error("Update Canteen Error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

exports.getCanteenById = async (req, res) => {
  try {
    const { id } = req.params

    const canteen = await Canteen.findOne({ _id: id, isDeleted: false })
      .populate("campus")
      .populate("owner", "name email")

    if (!canteen) {
      return res.status(404).json({
        success: false,
        message: "Canteen not found",
      })
    }

    res.status(200).json({
      success: true,
      canteen: {
        ...canteen.toObject(),
        imageCount: canteen.images.length,
        imageRequirements: {
          min: 1,
          max: 3,
          current: canteen.images.length,
        },
      },
    })
  } catch (error) {
    console.error("Fetch Canteen Error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

exports.getMyCanteen = async (req, res) => {
  try {
    const userId = req.user._id

    const canteen = await Canteen.findOne({
      owner: userId,
      isDeleted: false,
    })
      .populate("campus", "name code city")
      .populate("owner", "name email")

    if (!canteen) {
      return res.status(404).json({
        success: false,
        message: "No canteen found for this user",
      })
    }

    res.status(200).json({
      success: true,
      canteen: {
        ...canteen.toObject(),
        imageCount: canteen.images.length,
        imageRequirements: {
          min: 1,
          max: 3,
          current: canteen.images.length,
        },
      },
      approvalStatus: {
        isApproved: canteen.isApproved,
        status: canteen.approvalStatus,
        canOperate: canteen.isApproved && canteen.isOpen,
        message:
          canteen.approvalStatus === "pending"
            ? "Your canteen is pending admin approval"
            : canteen.approvalStatus === "rejected"
              ? `Your canteen was rejected: ${canteen.rejectionReason}`
              : "Your canteen is approved and operational",
      },
    })
  } catch (error) {
    console.error("Error fetching my canteen:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
