const QRCode = require('qrcode');
const crypto = require('crypto');
const Item = require('../models/Item');
const GroupOrder = require("../models/groupOrder");
const User = require("../models/User");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createGroupOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { canteen } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!canteen) return res.status(400).json({ message: "Canteen ID is required" });

    const groupLink = `group-order-${crypto.randomBytes(8).toString('hex')}`;
    const qrCodeUrl = await QRCode.toDataURL(`https://campus-bites-c7pe.vercel.app/join-group?link=${groupLink}`);

    // Generate 6-8 digit order number
    const lastGroupOrder = await GroupOrder.findOne().sort({ createdAt: -1 });
    let orderNumber = 100000;
    if (lastGroupOrder && lastGroupOrder.orderNumber) {
      orderNumber = Math.max(100000, lastGroupOrder.orderNumber + 1);
      while (orderNumber > 99999999) orderNumber = 100000; // Reset if exceeds 8 digits
    }

    const groupOrder = await GroupOrder.create({
      creator: user._id,
      members: [user._id],
      groupLink,
      qrCodeUrl,
      canteen,
      orderNumber
    });

    return res.status(201).json({
      success: true,
      message: "Group order created successfully",
      data: { groupLink, qrCodeUrl, groupOrderId: groupOrder._id, orderNumber }
    });
  } catch (err) {
    console.error("Create Group Order Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateGroupOrder = async (req, res) => {
  try {
    const { groupOrderId, items, splitType, amounts, payer, pickupTime, canteen, paymentMethod } = req.body;
    const userId = req.user._id;

    const groupOrder = await GroupOrder.findById(groupOrderId);
    if (!groupOrder) return res.status(404).json({ message: "Group order not found" });
    if (!groupOrder.members.includes(userId)) return res.status(403).json({ message: "Unauthorized" });
    if (!groupOrder.canteen && !canteen) return res.status(400).json({ message: "Canteen ID is required" });

    // Ensure paymentDetails is initialized
    if (!groupOrder.paymentDetails) {
      groupOrder.paymentDetails = { transactions: [], amounts: [], splitType: 'equal', payer: groupOrder.creator };
    }

    // Update canteen if provided
    if (canteen) groupOrder.canteen = canteen;

    let totalAmount = 0;
    const itemDetails = [];
    for (const item of items) {
      const dbItem = await Item.findById(item.item);
      if (!dbItem) return res.status(404).json({ message: `Item ${item.item} not found` });
      totalAmount += dbItem.price * item.quantity;
      itemDetails.push({
        item: item.item,
        quantity: item.quantity,
        nameAtPurchase: dbItem.name,
        priceAtPurchase: dbItem.price
      });
    }

    groupOrder.items = itemDetails;
    groupOrder.totalAmount = totalAmount;
    groupOrder.paymentDetails.splitType = splitType || 'equal';
    groupOrder.paymentDetails.amounts = amounts || groupOrder.members.map(member => ({
      user: member,
      amount: totalAmount / groupOrder.members.length
    }));
    groupOrder.paymentDetails.payer = payer || groupOrder.creator;
    groupOrder.paymentDetails.paymentMethod = paymentMethod || 'upi';

    // Validate amounts
    const assignedTotal = groupOrder.paymentDetails.amounts.reduce((sum, a) => sum + a.amount, 0);
    if (Math.abs(assignedTotal - totalAmount) > 0.01 && splitType === 'custom') {
      return res.status(400).json({ message: "Assigned amounts do not match total order amount" });
    }

    // Create individual orders and transactions for each member
    const transactions = [];
    for (const amountEntry of groupOrder.paymentDetails.amounts) {
      const user = await User.findById(amountEntry.user);
      if (!user) {
        console.warn(`User ${amountEntry.user} not found, skipping transaction`);
        continue;
      }

      const orderNumber = `ORD-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

      const memberOrder = await Order.create({
        OrderNumber: orderNumber,
        student: amountEntry.user,
        canteen: groupOrder.canteen,
        items: itemDetails,
        total: amountEntry.amount,
        status: "pending",
        pickupTime: pickupTime || new Date().toISOString(),
        groupOrderId: groupOrderId
      });

      if (paymentMethod === 'cod') {
        const transaction = await Transaction.create({
          orderId: memberOrder._id,
          userId: amountEntry.user,
          amount: amountEntry.amount,
          currency: "INR",
          status: "created",
          paymentMethod: "cod"
        });

        memberOrder.status = "payment_pending";
        await memberOrder.save();

        groupOrder.paymentDetails.transactions.push({
          user: amountEntry.user,
          transactionId: transaction._id,
          status: "created"
        });

        transactions.push({
          userId: amountEntry.user,
          transactionId: transaction._id,
          amount: amountEntry.amount,
          orderId: memberOrder._id
        });
      } else {
        const existingTransaction = await Transaction.findOne({
          orderId: memberOrder._id,
          status: { $in: ["created", "attempted", "paid"] }
        });
        if (existingTransaction) {
          transactions.push({
            userId: amountEntry.user,
            transactionId: existingTransaction._id,
            razorpayOrderId: existingTransaction.razorpayOrderId,
            amount: amountEntry.amount,
            orderId: memberOrder._id
          });
          continue;
        }

        const receiptBase = `${groupOrderId}_${amountEntry.user}`;
        const receiptHash = crypto.createHash('md5').update(receiptBase).digest('hex').slice(0, 8);
        const receipt = `grp_${groupOrderId.slice(-4)}_${receiptHash}`;

        try {
          const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(amountEntry.amount * 100),
            currency: "INR",
            receipt: receipt,
            notes: {
              orderId: memberOrder._id.toString(),
              userId: amountEntry.user.toString(),
              groupOrderId: groupOrderId,
              canteenId: groupOrder.canteen.toString()
            }
          });

          const transaction = await Transaction.create({
            orderId: memberOrder._id,
            userId: amountEntry.user,
            razorpayOrderId: razorpayOrder.id,
            amount: amountEntry.amount,
            currency: "INR",
            status: "created",
            paymentMethod: "upi"
          });

          memberOrder.status = "payment_pending";
          await memberOrder.save();

          groupOrder.paymentDetails.transactions.push({
            user: amountEntry.user,
            transactionId: transaction._id,
            status: "created"
          });

          transactions.push({
            userId: amountEntry.user,
            transactionId: transaction._id,
            razorpayOrderId: razorpayOrder.id,
            amount: amountEntry.amount,
            orderId: memberOrder._id
          });
        } catch (razorpayError) {
          console.error(`Razorpay error for user ${amountEntry.user}:`, razorpayError);
          continue; // Skip failed transactions but continue processing others
        }
      }
    }

    if (transactions.length > 0) {
      groupOrder.status = "payment_pending";
    }
    await groupOrder.save();

    return res.status(200).json({
      success: true,
      message: "Group order updated and transactions initiated successfully",
      data: { groupOrder, transactions }
    });
  } catch (err) {
    console.error("Update Group Order Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { groupOrderId, status } = req.body;
    const userId = req.user._id;

    const groupOrder = await GroupOrder.findById(groupOrderId);
    if (!groupOrder) return res.status(404).json({ message: "Group order not found" });

    // Check if user is a vendor for COD status updates
    const user = await User.findById(userId);
    if (groupOrder.paymentDetails.paymentMethod === 'cod' && !user.isVendor) {
      return res.status(403).json({ message: "Only vendors can update COD order status" });
    }

    // Update status
    if (["pending", "payment_pending", "placed", "preparing", "ready", "completed", "cancelled"].includes(status)) {
      groupOrder.status = status;

      // Update individual orders
      const orders = await Order.find({ groupOrderId });
      for (const order of orders) {
        order.status = status;
        await order.save();
      }

      // Update transaction statuses
      if (status === "completed" || status === "cancelled") {
        for (const transaction of groupOrder.paymentDetails.transactions) {
          const tx = await Transaction.findById(transaction.transactionId);
          if (tx) {
            tx.status = status === "completed" ? "paid" : "cancelled";
            await tx.save();
            transaction.status = tx.status;
          }
        }
      }

      await groupOrder.save();
      return res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: { groupOrder }
      });
    } else {
      return res.status(400).json({ message: "Invalid status" });
    }
  } catch (err) {
    console.error("Update Order Status Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Remaining controller methods unchanged
exports.joinGroupOrder = async (req, res) => {
  try {
    const { link } = req.body;
    const userId = req.user._id;

    if (!link) {
      return res.status(400).json({ message: "Group link is required" });
    }

    const groupOrder = await GroupOrder.findOne({ groupLink: link });
    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    if (groupOrder.members.includes(userId)) {
      return res.status(400).json({ message: "User already in group" });
    }

    groupOrder.members.push(userId);
    await groupOrder.save();

    return res.status(200).json({
      success: true,
      message: "Joined group order successfully",
      data: { groupOrderId: groupOrder._id },
    });
  } catch (err) {
    console.error("Join Group Order Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getGroupOrderByLink = async (req, res) => {
  try {
    const { groupLink } = req.params;
    if (!groupLink) {
      return res.status(400).json({ message: "Group link is required" });
    }

    const groupOrder = await GroupOrder.findOne({ groupLink })
      .populate("creator", "name email")
      .populate("members", "name email")
      .populate("items.item", "name price")
      .populate("paymentDetails.amounts.user", "name email")
      .populate("paymentDetails.transactions.user", "name email")
      .lean();

    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    return res.status(200).json({ success: true, groupOrder });
  } catch (err) {
    console.error("Error fetching group order:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

exports.updateGroupOrderItems = async (req, res) => {
  try {
    const userId = req.user._id;
    const { groupOrderId, items } = req.body;
    
    if (!groupOrderId || !items) {
      return res.status(400).json({ message: "Group Order ID and items are required." });
    }

    const groupOrder = await GroupOrder.findById(groupOrderId);

    if (!groupOrder) {
      return res.status(404).json({ message: "Group Order not found." });
    }

    if (!groupOrder.members.some(m => m.toString() === userId.toString())) {
      return res.status(403).json({ message: "Unauthorized to update this group order." });
    }

    const updatedItemsForDb = [];
    let newTotalAmount = 0;

    for (const itemData of items) {
      const menuItem = await Item.findById(itemData.item);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item with ID ${itemData.item} not found.` });
      }
      updatedItemsForDb.push({
        item: menuItem._id,
        quantity: itemData.quantity,
        nameAtPurchase: menuItem.name,
        priceAtPurchase: menuItem.price,
      });
      newTotalAmount += menuItem.price * itemData.quantity;
    }

    groupOrder.items = updatedItemsForDb;
    groupOrder.totalAmount = newTotalAmount;

    await groupOrder.save();

    return res.status(200).json({
      success: true,
      message: "Group order items updated successfully.",
      data: { groupOrder },
    });
  } catch (error) {
    console.error("Error updating group order items:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};