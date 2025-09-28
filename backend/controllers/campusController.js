const Campus = require("../models/Campus")

exports.createCampus = async (req, res) => {
  try {
    const { name, code, city } = req.body
    const userRole = req.user.role

    // Only admins can create campuses directly
    if (userRole !== "admin") {
      return res.status(403).json({
        message: "Only admins can create campuses",
      })
    }

    const existing = await Campus.findOne({ code })
    if (existing) {
      return res.status(400).json({ message: "Campus with this code already exists." })
    }

    const campus = await Campus.create({
      name,
      code,
      city,
      isDeleted: false,
    })

    res.status(201).json({
      message: "Campus created successfully",
      campus,
    })
  } catch (err) {
    console.error("Error creating campus:", err)
    res.status(500).json({ message: "Internal server error" })
  }
}

exports.requestCampusCreation = async (req, res) => {
  try {
    const { name, code, city, reason } = req.body
    const userRole = req.user.role

    // Only canteen owners can request campus creation
    if (userRole !== "canteen") {
      return res.status(403).json({
        message: "Only canteen owners can request campus creation",
      })
    }

    if (!name || !code || !city) {
      return res.status(400).json({ message: "Name, code, and city are required" })
    }

    // Check if campus already exists
    const existing = await Campus.findOne({ code })
    if (existing) {
      return res.status(400).json({
        message: "Campus with this code already exists. You can select it during registration.",
        campus: existing,
      })
    }

    // For now, we'll create a pending campus request
    // In a real implementation, you'd have a separate CampusRequest model
    // and notify admins via email/notification system

    // Create the campus request (you might want to create a separate model for this)
    const campusRequest = {
      name,
      code,
      city,
      requestedBy: req.user._id,
      reason: reason || "New campus needed for canteen registration",
      status: "pending",
      createdAt: new Date(),
    }

    // For now, we'll just log this and return success
    // In production, save to CampusRequest model and notify admins

    res.status(200).json({
      message: "Campus creation request submitted successfully. Admin will review and create the campus.",
      request: campusRequest,
    })
  } catch (err) {
    console.error("Error requesting campus creation:", err)
    res.status(500).json({ message: "Internal server error" })
  }
}

exports.getAllCampuses = async (req, res) => {
  try {
    const campuses = await Campus.find({ isDeleted: false })
    res.status(200).json({ success:true,data: campuses })
  } catch (err) {
    console.error("Error fetching campuses:", err)
    res.status(500).json({success:false, message: "Server error" })
  }
}

exports.deleteCampus = async (req, res) => {
  try {
    const { id } = req.params
    const userRole = req.user.role

    // Only admins can delete campuses
    if (userRole !== "admin") {
      return res.status(403).json({
        message: "Only admins can delete campuses",
      })
    }

    const campus = await Campus.findById(id)
    if (!campus) {
      return res.status(404).json({ message: "Campus not found" })
    }

    if (campus.isDeleted) {
      return res.status(400).json({ message: "Campus already deleted" })
    }

    campus.isDeleted = true
    await campus.save()

    res.status(200).json({ message: "Campus soft-deleted successfully" })
  } catch (err) {
    console.error("Error deleting campus:", err)
    res.status(500).json({ message: "Internal server error" })
  }
}

exports.updateCampus = async (req, res) => {
  try {
    const { id } = req.params
    const { name, code, city } = req.body
    const userRole = req.user.role

    // Only admins can update campuses
    if (userRole !== "admin") {
      return res.status(403).json({
        message: "Only admins can update campuses",
      })
    }

    const updatedCampus = await Campus.findByIdAndUpdate(id, { name, code, city }, { new: true, runValidators: true })

    if (!updatedCampus) {
      return res.status(404).json({ message: "Campus not found" })
    }

    res.status(200).json({ message: "Campus updated successfully", campus: updatedCampus })
  } catch (error) {
    console.error("Error updating campus:", error)
    res.status(500).json({ message: "Internal server error", error: error.message })
  }
}

exports.getCampusById = async (req, res) => {
  try {
    const { id } = req.params

    const campus = await Campus.findOne({ _id: id, isDeleted: false })

    if (!campus) {
      return res.status(404).json({ message: "Campus not found" })
    }

    res.status(200).json({ campus })
  } catch (error) {
    console.error("Error fetching campus:", error)
    res.status(500).json({ message: "Internal server error", error: error.message })
  }
}