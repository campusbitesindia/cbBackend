const sendNotification = require('../utils/notify');
const Notification = require('../models/Notification');
const SendNotification=require("../utils/sendNotification")

const User =require("../models/User")
// POST /api/notifications/user
exports.sendNotificationToUser = async (req, res) => {
  try {
    const { userId, message, type = 'order' } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ success: false, message: "Missing userId or message" });
    }

    // 🔥 Save in DB
    const dbNotif = await Notification.create({
      user: userId,
      message,
      type,
    });

    // 🔥 Send via socket
    sendNotification(`user_${userId}`, {
      type,
      message,
      timestamp: dbNotif.createdAt,
    });

    return res.status(200).json({ success: true, notification: dbNotif });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
// works

// GET /api/notifications/user/:id
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.id;

    const notifications = await Notification.find({
      user: userId,
      isDeleted: false
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
// works


exports.sendPublicKey=async(req,res)=>{
  try{
      return res.status(200).json({
        success:true,
        publicKey:process.env.publicKey
      })
  }
  catch(err){
    return res.status(500).json({
      success:false,
      message:"internal server error"
    })
  }
}

// POST /api/v1/notifications/subscribe
exports.saveSubscription = async (req, res) => {
  try {
    
    const { userId,subscription} = req.body;
    
   console.log(userId,subscription);
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found", 
      });
    }

    if (user.subscription === subscription) {
      return res.status(200).json({
        success: true,
        message: "Subscription already up-to-date",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { subscription },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Data saved successfully",
      
    });
  } catch (err) {
    console.error("Error saving subscription:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};