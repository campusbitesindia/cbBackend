const Order=require("../models/Order");
const User =require("../models/User");
const Transaction=require("../models/Transaction");
const Penalty=require("../models/penaltySchema");
const  SendNotification  = require("../utils/sendNotification");

exports.CreateCODTransaction = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Please provide the order ID",
      });
    }

    const order = await Order.findById(orderId).populate("student");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order with this ID not found",
      });
    }
    if(order.status!=='pending'){
        return res.status(400).json({
            success:false,
            message:"Order has been placed or cancelled"
        })
    }
    const existingTransaction = await Transaction.findOne({ orderId: order._id });
    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: "Transaction already exists for this order. Please create a new order.",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: "COD", status: "placed" },
      { new: true }
    ).populate("canteen student");

    const transaction = await Transaction.create({
      orderId: order._id,
      userId: order.student._id,
      amount: order.total,
      paymentMethod: "COD",
      currency: "INR",
    });

    await SendNotification(order.student._id, "Order Placed", "Your Order has been Placed");

    const canteenOwner = await User.findOne({ canteenId: order.canteen });
    if (canteenOwner) {
      await SendNotification(
        canteenOwner._id,
        "New Order",
        `New Order has arrived with Order ID ${order.OrderNumber}`
      );
    }
    global.io.to(order.canteen.toString()).emit("New_Order",updatedOrder);
    return res.status(200).json({
      success: true,
      message: "Transaction created successfully",
      data: { transaction, order: updatedOrder },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
