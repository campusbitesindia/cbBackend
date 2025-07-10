const mongoose = require("mongoose");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "canteen"], required: true },
  campus: { type: mongoose.Schema.Types.ObjectId, ref: "Campus", required: true },
  canteenId: { type: mongoose.Schema.Types.ObjectId, ref: "Canteen" },
  profileImage: { type: String },
  isDeleted: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  resetPasswordToken:String,
  resetPasswordExpire: Date,
}, { timestamps: true });

UserSchema.methods.getresetpass=function(){
    const resetToken=crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire=new Date(Date.now()+15*60*1000);
    return resetToken;
}

module.exports = mongoose.model("User", UserSchema);