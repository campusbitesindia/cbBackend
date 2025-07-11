const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "General" },
    canteen: { type: mongoose.Schema.Types.ObjectId, ref: "Canteen", required: true },
    isVeg: { type: Boolean, default: true },
    image: { type: String, default: "" },
    available: { type: Boolean, default: true },
    __v: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Menu", MenuSchema); 