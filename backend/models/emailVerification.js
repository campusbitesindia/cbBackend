const mongoose= require("mongoose");
  
const sendEmailVerificationSchema= new mongoose.Schema({
  userId: {type:mongoose.Schema.Types.ObjectId, ref:'User',
      required: true
  },
  otp: {type: String, required: true},
}, {timestamps: true});

const sendEmailVerificationModel = mongoose.model("EmailVerification", sendEmailVerificationSchema);
module.exports=sendEmailVerificationModel;