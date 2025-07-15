const Canteen = require("../models/Canteen")
const cloudinary = require("../utils/cloudinary")

// Create Canteen with image support
exports.createCanteen = async (req, res) => {
  try {
    const { name, campus } = req.body
    const userRole = req.user.role

    // Only canteen owners can create canteens
    if (userRole !== "canteen") {
      return res.status(403).json({
        message: "Only canteen owners can create canteens",
      })
    }

    if (!name || !campus) {
      return res.status(400).json({ message: "Name and campus are required" })
    }

    // Verify that the campus exists and is not deleted
    const Campus = require("../models/Campus")
    const campusDoc = await Campus.findOne({ _id: campus, isDeleted: false })
    if (!campusDoc) {
      return res.status(400).json({
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
        message: "You already have a canteen. Each vendor can only have one canteen.",
      })
    }

    // Handle image uploads (if any)
    let imageUrls = []
    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "campus_bites/canteens",
            resource_type: "image",
          }),
        ),
      )
      imageUrls = uploads.map((upload) => upload.secure_url)
    }

    const newCanteen = await Canteen.create({
      name,
      campus: campusDoc._id,
      owner: req.user._id,
      images: imageUrls,
    })

    // Update user's canteenId
    const User = require("../models/User")
    await User.findByIdAndUpdate(req.user._id, { canteenId: newCanteen._id })

    res.status(201).json({
      message: "Canteen created successfully",
      canteen: newCanteen,
    })
  } catch (error) {
    console.error("Error in creating canteen:", error)
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    })
  }
}

exports.getAllCanteens = async (req, res) => {
  try {
    const { campus, owner } = req.query;
    const filter = { isDeleted: false };
    if (campus) filter.campus = campus;
    if (owner) filter.owner = owner;
    const canteens = await Canteen.find(filter)
      .populate("campus", "name code city")
      .select("-__v");
    res.status(200).json({ canteens });
  } catch (err) {
    console.error("Error fetching canteens:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteCanteen = async (req, res) => {
  try {
    const { id } = req.params
    const userRole = req.user.role

    // Only canteen owners can delete canteens
    if (userRole !== "canteen") {
      return res.status(403).json({
        message: "Only canteen owners can delete canteens",
      })
    }

    const canteen = await Canteen.findById(id)

    if (!canteen) {
      return res.status(404).json({ message: "Canteen not found" })
    }

    // Ensure the user owns this canteen
    if (canteen.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only delete your own canteen",
      })
    }

    if (canteen.isDeleted) {
      return res.status(400).json({ message: "Canteen already deleted" })
    }

    canteen.isDeleted = true
    await canteen.save()

    res.status(200).json({ message: "Canteen soft-deleted successfully" })
  } catch (err) {
    console.error("Error deleting canteen:", err)
    res.status(500).json({ message: "Internal server error" })
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
        message: "Only canteen owners can update canteens",
      })
    }

    const canteen = await Canteen.findById(id)
    if (!canteen || canteen.isDeleted) {
      return res.status(404).json({ message: "Canteen not found" })
    }

    // Ensure the user owns this canteen
    if (canteen.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only update your own canteen",
      })
    }

    // Clear all images if requested
    if (clearImages === "true") {
      canteen.images = []
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: "campus_bites/canteens",
        }),
      )
      const uploaded = await Promise.all(uploadPromises)
      canteen.images = uploaded.map((file) => file.secure_url)
    }

    if (name) canteen.name = name
    if (isOpen !== undefined) canteen.isOpen = isOpen

    await canteen.save()

    res.status(200).json({ message: "Canteen updated", canteen })
  } catch (error) {
    console.error("Update Canteen Error:", error)
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    })
  }
}

exports.getCanteenById = async (req, res) => {
  try {
    const { id } = req.params
    console.log(`Received canteen ID: ${id}`);

    const canteen = await Canteen.findOne({ _id: id, isDeleted: false }).populate("campus")

    if (!canteen) {
      return res.status(404).json({ message: "Canteen not found" })
    }

    res.status(200).json({ canteen })
  } catch (error) {
    console.error("Fetch Canteen Error:", error)
    res.status(500).json({ message: "Internal server error", error: error.message })
  }
}

exports.getMyCanteen = async (req, res) => {
  try {
    const canteen = await Canteen.findOne({ owner: req.user._id, isDeleted: false }).populate("campus");
    if (!canteen) {
      return res.status(404).json({ message: "No canteen found for this user" });
    }
    res.status(200).json({ canteen });
  } catch (error) {
    console.error("getMyCanteen error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
