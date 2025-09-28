const Canteen = require("../models/Canteen")
const cloudinary = require("../utils/cloudinary")
const bcrypt=require("bcrypt")
// Create Canteen with image support and business details
exports.createCanteen = async (req, res) => {
  try {
    const {
      name,
      campus,
      adhaarNumber,
      panNumber,
      gstNumber,
      password,
      fssaiLicense,
      contactPersonName,
      mobile,
      email,
      address,
      openingHours,
      closingHours,
      operatingDays,
      description,
      role,
    } = req.body;

    // 1. Only canteen owners can create canteens
    if (role !== "canteen") {
      return res.status(403).json({
        success: false,
        message: "Only canteen owners can create canteens",
      });
    }

    // 2. Validate required fields
    const requiredFields = [
      "name",
      "campus",
      "adhaarNumber",
      "panNumber",
      "gstNumber",
      "contactPersonName",
      "mobile",
      "email",
      "address",
      "openingHours",
      "closingHours",
      "password",
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`,
        });
      }
    }

    // 3. Validate opening & closing time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(openingHours) || !timeRegex.test(closingHours)) {
      return res.status(400).json({
        success: false,
        message: "Opening and closing hours must be in HH:MM format (24-hour)",
      });
    }

    // Ensure closing time is after opening time
    const [openHour, openMin] = openingHours.split(":").map(Number);
    const [closeHour, closeMin] = closingHours.split(":").map(Number);
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    if (closeMinutes <= openMinutes) {
      return res.status(400).json({
        success: false,
        message: "Closing time must be after opening time",
      });
    }

    // 4. Verify campus exists
    const Campus = require("../models/Campus");
    const campusDoc = await Campus.findOne({ _id: campus, isDeleted: false });
    console.log(campusDoc)
    if (!campusDoc) {
      return res.status(400).json({
        success: false,
        message:
          "Selected campus not found or is inactive. Please request campus creation if it doesn't exist.",
      });
    }

    // 6. Uniqueness checks (business details, contact info)
    const duplicateChecks = [
      { field: "adhaarNumber", value: adhaarNumber, msg: "Adhaar number is already registered" },
      { field: "panNumber", value: panNumber, msg: "PAN number is already registered" },
      { field: "gstNumber", value: gstNumber, msg: "GST number is already registered" },
      { field: "mobile", value: mobile, msg: "Mobile number is already registered" },
      { field: "email", value: email, msg: "Email address is already registered" },
      { field: "fssaiLicense", value: fssaiLicense, msg: "FSSAI license is already registered" },
    ];
    console.log(email);
    for (const check of duplicateChecks) {
      if (check.value) {
        const exists = await Canteen.findOne({ [check.field]: check.value, isDeleted: false });
        console.log(exists)
        if (exists) {
          return res.status(400).json({ success: false, message: check.msg });
        }
      }
    }

    // 7. Validate image count
    if (!req.files || req.files.length < 1) {
      return res.status(400).json({
        success: false,
        message: "At least 1 image is required",
      });
    }
    if (req.files.length > 3) {
      return res.status(400).json({
        success: false,
        message: "Maximum 3 images allowed",
      });
    }

    // 8. Upload images to Cloudinary
    let imageUrls = [];
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
          })
        )
      );
      imageUrls = uploads.map((u) => u.secure_url);
    } catch (uploadError) {
      return res.status(500).json({
        success: false,
        message: "Image upload failed",
        error: uploadError.message,
      });
    }

    // 9. Parse operating days
    let parsedOperatingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (operatingDays) {
      try {
        parsedOperatingDays = Array.isArray(operatingDays)
          ? operatingDays
          : JSON.parse(operatingDays);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid operating days format",
        });
      }
    }
      const User = require("../models/User");
       const hashedPass = await bcrypt.hash(password, 10);
       const newUser= await User.create({
          name: contactPersonName,
          password: hashedPass,
          email,
          role,
          phone: mobile,
          campus: campusDoc._id,
        });
    // 10. Create new canteen
    const newCanteen = await Canteen.create({
      name,
      campus: campusDoc._id,
      owner: newUser._id,
      images: imageUrls,
      adhaarNumber,
      panNumber,
      gstNumber,
      fssaiLicense,
      contactPersonName,
      mobile,
      email,
      address,
      operatingHours: { opening: openingHours, closing: closingHours },
      operatingDays: parsedOperatingDays,
      description,
      isOpen: false,
      isApproved: false,
      approvalStatus: "pending",
    });

    // 11. Create corresponding user account
  

    newUser.canteenId=newCanteen._id;
    await newUser.save();

    // 12. Response
    res.status(201).json({
      success: true,
      message: "Canteen created successfully and is pending admin approval",
      canteen: {
        id: newCanteen._id,
        name: newCanteen.name,
        campus: campusDoc.name,
        images: imageUrls,
        mobile: newCanteen.mobile,
        email: newCanteen.email,
        address: newCanteen.address,
        operatingHours: newCanteen.operatingHours,
        operatingDays: newCanteen.operatingDays,
        approvalStatus: newCanteen.approvalStatus,
      },
      nextSteps: [
        "Wait for admin approval",
        "Set up your bank details for payouts",
        "Once approved, add menu items",
        "Operate during specified hours",
      ],
    });
  } catch (error) {
    console.error("Error in creating canteen:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

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
      .populate("owner", "name email profileImage")
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
    const {
      name,
      isOpen,
      clearImages,
      mobile,
      email,
      address,
      openingHours,
      closingHours,
      operatingDays,
      description,
    } = req.body
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

    // Validate time format if provided
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (openingHours && !timeRegex.test(openingHours)) {
      return res.status(400).json({
        success: false,
        message: "Opening hours must be in HH:MM format (24-hour)",
      })
    }
    if (closingHours && !timeRegex.test(closingHours)) {
      return res.status(400).json({
        success: false,
        message: "Closing hours must be in HH:MM format (24-hour)",
      })
    }

    // Validate that closing time is after opening time if both are provided
    if (openingHours && closingHours) {
      const [openHour, openMin] = openingHours.split(":").map(Number)
      const [closeHour, closeMin] = closingHours.split(":").map(Number)
      const openMinutes = openHour * 60 + openMin
      const closeMinutes = closeHour * 60 + closeMin

      if (closeMinutes <= openMinutes) {
        return res.status(400).json({
          success: false,
          message: "Closing time must be after opening time",
        })
      }
    }

    // Check for duplicate mobile and email if they're being updated
    if (mobile && mobile !== canteen.mobile) {
      const duplicateMobile = await Canteen.findOne({ mobile, isDeleted: false, _id: { $ne: id } })
      if (duplicateMobile) {
        return res.status(400).json({
          success: false,
          message: "Mobile number is already registered with another canteen",
        })
      }
    }

    if (email && email !== canteen.email) {
      const duplicateEmail = await Canteen.findOne({ email, isDeleted: false, _id: { $ne: id } })
      if (duplicateEmail) {
        return res.status(400).json({
          success: false,
          message: "Email address is already registered with another canteen",
        })
      }
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

    // Update fields
    if (name) canteen.name = name
    if (isOpen !== undefined) canteen.isOpen = isOpen
    if (mobile) canteen.mobile = mobile
    if (email) canteen.email = email
    if (address) canteen.address = address
    if (description !== undefined) canteen.description = description

    // Update operating hours
    if (openingHours || closingHours) {
      canteen.operatingHours = {
        opening: openingHours || canteen.operatingHours.opening,
        closing: closingHours || canteen.operatingHours.closing,
      }
    }

    // Update operating days
    if (operatingDays) {
      try {
        canteen.operatingDays = Array.isArray(operatingDays) ? operatingDays : JSON.parse(operatingDays)
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid operating days format",
        })
      }
    }

    await canteen.save()

    res.status(200).json({
      success: true,
      message: "Canteen updated successfully",
      canteen: {
        id: canteen._id,
        name: canteen.name,
        isOpen: canteen.isOpen,
        mobile: canteen.mobile,
        email: canteen.email,
        address: canteen.address,
        operatingHours: canteen.operatingHours,
        operatingDays: canteen.operatingDays,
        images: canteen.images,
        imageCount: canteen.images.length,
        approvalStatus: canteen.approvalStatus,
        description: canteen.description,
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
