const Canteen = require("../models/Canteen");
const cloudinary = require("../utils/cloudinary");

// Create Canteen with image support
exports.createCanteen = async (req, res) => {
    try {
        const { name, campus } = req.body;

        if (!name || !campus) {
        return res.status(400).json({ message: "Name and campus are required" });
        }

        // Handle image uploads (if any)
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
        const uploads = await Promise.all(
            req.files.map(file =>
            cloudinary.uploader.upload(file.path, {
                folder: "campus_bites/canteens",
                resource_type: "image",
            })
            )
        );
        imageUrls = uploads.map(upload => upload.secure_url);
        }

        const newCanteen = await Canteen.create({
        name,
        campus,
        owner: req.user?._id || null, // assuming req.user from auth middleware
        images: imageUrls,
        });

        res.status(201).json({ message: "Canteen created successfully", canteen: newCanteen });
    } catch (error) {
        console.error("Error in creating canteen:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.getAllCanteens = async (req, res) => {
    try {
        const { campus } = req.query;

        // Filter: if campus is passed, filter by campus ID
        const filter = { isDeleted: false };
        if (campus) {
        filter.campus = campus; // campus should be ObjectId
        }

        const canteens = await Canteen.find(filter)
        .populate("campus", "name code city") // optional: include campus info
        .select("-__v");

        res.status(200).json({ canteens });
    } catch (err) {
        console.error("Error fetching canteens:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteCanteen = async (req, res) => {
    try {
        const { id } = req.params;

        const canteen = await Canteen.findById(id);

        if (!canteen) {
        return res.status(404).json({ message: "Canteen not found" });
        }

        if (canteen.isDeleted) {
        return res.status(400).json({ message: "Canteen already deleted" });
        }

        canteen.isDeleted = true;
        await canteen.save();

        res.status(200).json({ message: "Canteen soft-deleted successfully" });
    } catch (err) {
        console.error("Error deleting canteen:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateCanteen = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, isOpen, clearImages } = req.body; // 🆕 added clearImages

        const canteen = await Canteen.findById(id);
        if (!canteen || canteen.isDeleted) {
        return res.status(404).json({ message: "Canteen not found" });
        }

        // 🧹 Clear all images if requested
        if (clearImages === "true") {
        canteen.images = [];
        }

        //  Handle uploaded images
        if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(file =>
            cloudinary.uploader.upload(file.path, {
            folder: "campus_bites/canteens",
            })
        );
        const uploaded = await Promise.all(uploadPromises);
        canteen.images = uploaded.map(file => file.secure_url);
        }

        if (name) canteen.name = name;
        if (isOpen !== undefined) canteen.isOpen = isOpen;

        await canteen.save();

        res.status(200).json({ message: "Canteen updated", canteen });
    } catch (error) {
        console.error("Update Canteen Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


exports.getCanteenById = async (req, res) => {
    try {
        const { id } = req.params;

        const canteen = await Canteen.findOne({ _id: id, isDeleted: false }).populate("campus");

        if (!canteen) {
        return res.status(404).json({ message: "Canteen not found" });
        }

        res.status(200).json({ canteen });
    } catch (error) {
        console.error("Fetch Canteen Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};