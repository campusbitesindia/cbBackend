const Order = require("../models/Order");
const User = require("../models/User");
const Item = require("../models/Item");
const Canteen = require("../models/Canteen");
const Campus = require("../models/Campus");
const SendNotification = require("../utils/sendNotification");
const Penalty = require("../models/penaltySchema");
const Transaction = require("../models/Transaction");
const Counter = require("../models/CounterSchema");
exports.CreateOrder = async (req, res) => {
  try {
    const UserId = req.user._id;
    const campusId = req.user.campus;
    const { items: _items, pickUpTime, canteenId } = req.body;
    const deviceId = req.deviceInfo.deviceId;
    //assuming the Items is array which is converted to string by JSON.stringy method in frontEnd
    const Items = JSON.parse(_items); //converting _items to an Json array;

    //If all field are not found;
    if (!UserId || !campusId || !canteenId || Items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the fields",
      });
    }

    //search for student with Given id
    const student = await User.findById(UserId);
    // if student not found return error
    if (!student) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    // search canteen with given Id

    const canteen = await Canteen.findOne({ _id: canteenId, campus: campusId });

    //if canteen not found
    if (!canteen) {
      return res.status(400).json({
        success: false,
        message:
          "Canteen with this id Not found,please Select Canteen of Same campus",
      });
    }

    const OrderItem = [];
    let Total = 0;

    for (const key of Items) {
      //find the item
      const item = await Item.findById(key._id);
      //if item not found return status error
      if (!item) {
        return res.status(400).json({
          success: false,
          message: "Item not found",
        });
      }
      // if quantity is present in array we will take key.quantity other wise quantity will be 1
      const quantity = key.quantity || 1;

      //findt the total amount fo the order
      Total += item.price * quantity;

      // pushing data in OrderItem
      OrderItem.push({
        item: item._id,
        quantity,
        nameAtPurchase: item.name,
        priceAtPurchase: item.price,
      });
    }

    //checking or valid pickup time and the difference will be in mircoseconds
    const isValidPickUpTime =
      new Date(pickUpTime) - Date.now() >= 10 * 60 * 1000 ? true : false;

    // if pickup time is less than 10 minutes return erro
    if (!isValidPickUpTime) {
      return res.status(400).json({
        success: false,
        message: "PickUp time Can't Be less than 10 minutes",
      });
    }

    //generate the Order Number for the Order
    const customid = await Counter.findByIdAndUpdate(
      "order#",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const OrderNumber = customid._id + customid.seq;
    //create the order with penalty amount if applicable
    const penalty = await Penalty.find({
      deviceId,
      canteen: canteen._id,
      isPaid: false,
    });
    for (const data of penalty) {
      Total += data.Amount;
    }

    const order = await Order.create({
      OrderNumber: OrderNumber,
      student: student._id,
      canteen: canteen._id,
      items: OrderItem,
      total: Total,
      pickupTime: pickUpTime,
    });

    // Notify Vendor (socket room: vendor_<vendorId>

    return res.status(200).json({
      success: true,
      message: "order Created SuccessFully,penalty Applied If applicable",
      data: order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
      error: err.message,
    });
  }
};

exports.UpdateOrderStatus = async (req, res) => {
  try {
    const { id: OrderId } = req.params;
    console.log(req.body);
    const { status } = req.body;

    const role = req.user.role;

    // Validate input
    if (!OrderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Please enter all required fields",
      });
    }

    const allowedStatuses = ["preparing", "ready", "completed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // Fetch order
    const order = await Order.findById(OrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order with this ID not found",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cant Update Order Status As it is cancelled",
      });
    }

    // Handle cancellation + penalty for both Cod and online payment
    if (status === "cancelled" && role == "student") {
      const penaltyApplicableStatuses = ["preparing", "ready"];

      if (penaltyApplicableStatuses.includes(order.status)) {
        const penaltyAmount = Math.round(order.total * 0.5);
        const deviceId = req.deviceInfo?.deviceId;

        await Penalty.create({
          deviceId,
          canteen: order.canteen,
          user: order.student,
          Order: order._id,
          Amount: penaltyAmount,
          isPaid: false,
          reason: "Order cancelled after it moved to preparing or ready stage",
        });
        await Transaction.findOneAndUpdate(
          { orderId: order._id },
          { status: "cancelled" }
        );
        order.status = "cancelled";

        await SendNotification(
          order.student._id,
          "Order Status Updated",
          "Your order has been cancelled and penaly applied for next order"
        );

        await order.save();

        return res.status(200).json({
          success: true,
          message: "Order cancelled and penalty applied",
        });
      }
      // No penalty applied
      order.status = "cancelled";
      await order.save();
      await Transaction.findOneAndUpdate(
        { orderId: order._id },
        { status: "cancelled" }
      );

      await SendNotification(
        order.student._id,
        "Order Status Updated",
        "Your order has been cancelled"
      );
      return res.status(200).json({
        success: true,
        message: "Order cancelled with no penalty",
      });
    }

    if (status === "completed") {
      // update the penalty and transaction status for cod as user had paid  them
      const deviceId = req.deviceInfo?.deviceId;
      await Penalty.updateMany(
        { deviceId, canteen: order.canteen, isPaid: false },
        { isPaid: true }
      );
      await Transaction.findOneAndUpdate(
        { orderId: OrderId },
        { status: "paid", paidAt: new Date(Date.now()) }
      );
    }

    // For normal status updates
    const updatedOrder = await Order.findByIdAndUpdate(
      OrderId,
      { status },
      { new: true }
    )
      .populate({ path: "student", select: "name" })
      .populate({ path: "canteen", select: "name" });

    // After updating order status, notify student
    await SendNotification(
      order.student._id,
      "Order Status Changes",
      `Your Order is ${status}`
    );

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

//This is for Student Orders
exports.getAllOrdersByStudent = async (req, res) => {
  try {
    const studentId = req.user._id;
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student Id not found",
      });
    }
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Student not found",
      });
    }

    const Orders = await Order.find({ student: student._id })
      .populate({ path: "student", select: "name" })
      .populate({ path: "canteen", select: "name" })
      .populate({ path: "items.item", select: "name price image" })
      .sort({ createdAt: -1 });

    const filteredOrder = Orders.filter(
      (ele) => ele.isDeleted === false && ele.status !== "pending"
    );
    return res.status(200).json({
      success: true,
      message: "Orders Fetched SuccessFully",
      data: filteredOrder,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "internal Server Error",
      error: err.message,
    });
  }
};

exports.getAllOrdersByCanteen = async (req, res) => {
  try {
    //this is protected Route for Canteen only so we can fetch canteen id as it added by middleware
    const canteenId = req.user.canteenId;
    if (!canteenId) {
      return res.status(400).json({
        success: false,
        message: "Canteen Id not found",
      });
    }

    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(400).json({
        success: false,
        message: "canteen Data not found",
      });
    }

    const Orders = await Order.find({ canteen: canteen._id })
      .populate({ path: "student", select: "name" })
      .populate({ path: "canteen", select: "name" })
      .populate({ path: "items.item", select: "name image price description" })
      .sort({ createdAt: -1 });
    const filteredOrder = Orders.filter(
      (ele) =>
        ele.isDeleted === false &&
        ele.status !== "pending" &&
        ele.status != "payment_pending"
    );

    return res.status(200).json({
      success: true,
      message: "All Orders Fetched SuccessFully",
      data: filteredOrder,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server Error",
      error: err.message,
    });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId not found",
      });
    }
    const order = await Order.findById(orderId)
      .populate({ path: "student", select: "name" })
      .populate({ path: "canteen", select: "name" })
      .populate({ path: "items.item", select: "name image price description" });
    if (!order) {
      return res.status(400).json({
        success: false,
        message: "order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "orderDetails fetched SuccessFully",
      data: order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
      error: err.message,
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id: OrderId } = req.params;
    if (!OrderId) {
      return res.status(400).json({
        success: false,
        message: "order ID not found",
      });
    }

    const order = await Order.findByIdAndUpdate(
      OrderId,
      { isDeleted: true },
      { new: true }
    );
    if (!order) {
      return res.status(400).json({
        success: false,
        message: "order not found with this id",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Order Deleted SuccessFully",
      data: order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "internal server Error",
      error: err.message,
    });
  }
};
//this is for Student
exports.GetallDeletedOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User Id not found",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const Orders = await Order.find({ student: user._id, isDeleted: true })
      .populate({ path: "student", select: "name" })
      .populate({ path: "canteen", select: "name" });
    if (!Orders) {
      return res.status(400).json({
        success: false,
        message: "NO order Found",
      });
    }
    return res.status(200).json({
      success: false,
      message: "Deleted Orders Fetched SuccessFully",
      data: Orders,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

exports.getStudentOrderBystatus = async (req, res) => {
  try {
    const { id: studentid } = req.params;
    const { status } = req.body;
    if (!studentid) {
      return res.status(400).json({
        success: false,
        message: "id not found",
      });
    }
    const Student = await User.findById(studentid);
    if (!Student) {
      return res.status(400).json({
        success: false,
        message: "Student not found",
      });
    }
    const Orders = await Order.find({ student: Student._id, status })
      .populate({ path: "student", select: "name" })
      .populate({ path: "canteen", select: "name" })
      .populate({ path: "items.item", select: "name image price description" });
    if (Orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No Order with this Status",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Orders fetched SuccessFully",
      data: Orders,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
      error: err.message,
    });
  }
};

exports.getCanteenOrderBystatus = async (req, res) => {
  try {
    const { id: CanteenId } = req.params;
    const { status } = req.body;
    if (!CanteenId) {
      return res.status(400).json({
        success: false,
        message: "id not found",
      });
    }
    const Canteen = await User.findById(CanteenId);
    if (!Canteen) {
      return res.status(400).json({
        success: false,
        message: "canteen  not found",
      });
    }
    const Orders = await Order.find({ canteen: Canteen._id, status });
    if (Orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No Order with this Status",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Orders fetched SuccessFully",
      data: Orders,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
      error: err.message,
    });
  }
};
