const Campus = require("../models/Campus");

exports.createCampus = async (req, res) => {
    try {
        const { name, code, city } = req.body;

        const existing = await Campus.findOne({ code });
        if (existing) {
        return res.status(400).json({ message: "Campus with this code already exists." });
        }

        const campus = await Campus.create({
        name,
        code,
        city,
        isDeleted: false //  Add this explicitly
        });

        res.status(201).json({
        message: "Campus created successfully",
        campus
        });
    } catch (err) {
        console.error("Error creating campus:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getAllCampuses = async (req, res) => {
    try {
        const campuses = await Campus.find({ isDeleted: false });
        res.status(200).json({ campuses });
    } catch (err) {
        console.error("Error fetching campuses:", err);
        res.status(500).json({ message: "Server error" });
    }
};


exports.deleteCampus = async (req, res) => {
    try {
        const { id } = req.params;

        const campus = await Campus.findById(id);
        if (!campus) {
        return res.status(404).json({ message: "Campus not found" });
        }

        if (campus.isDeleted) {
        return res.status(400).json({ message: "Campus already deleted" });
        }

        campus.isDeleted = true;
        await campus.save();

        res.status(200).json({ message: "Campus soft-deleted successfully" });
    } catch (err) {
        console.error("Error deleting campus:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.updateCampus = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, city } = req.body;

        const updatedCampus = await Campus.findByIdAndUpdate(
        id,
        { name, code, city },
        { new: true, runValidators: true }
        );

        if (!updatedCampus) {
        return res.status(404).json({ message: "Campus not found" });
        }

        res.status(200).json({ message: "Campus updated successfully", campus: updatedCampus });
    } catch (error) {
        console.error("Error updating campus:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.getCampusById = async (req, res) => {
    try {
        const { id } = req.params;

        const campus = await Campus.findOne({ _id: id, isDeleted: false });

        if (!campus) {
        return res.status(404).json({ message: "Campus not found" });
        }

        res.status(200).json({ campus });
    } catch (error) {
        console.error("Error fetching campus:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
