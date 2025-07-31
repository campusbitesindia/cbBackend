const QRCode = require('qrcode');
const crypto = require('crypto');
const Item = require('../models/Item');
const GroupOrder = require("../models/GroupOrder");
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
    const qrCodeUrl = await QRCode.toDataURL(`http://localhost:3000/join-group?link=${groupLink}`);

    const groupOrder = await GroupOrder.create({
      creator: user._id,
      members: [user._id],
      groupLink,
      qrCodeUrl,
      canteen
    });

    return res.status(201).json({
      success: true,
      message: "Group order created successfully",
      data: { groupLink, qrCodeUrl, groupOrderId: groupOrder._id }
    });
  } catch (err) {
    console.error("Create Group Order Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateGroupOrder = async (req, res) => {
  try {
    const { groupOrderId, items, splitType, amounts, payer, pickupTime, canteen } = req.body;
    const userId = req.user._id;

    const groupOrder = await GroupOrder.findById(groupOrderId);
    if (!groupOrder) return res.status(404).json({ message: "Group order not found" });
    if (!groupOrder.members.includes(userId)) return res.status(403).json({ message: "Unauthorized" });
    if (!groupOrder.canteen && !canteen) return res.status(400).json({ message: "Canteen ID is required" });

    // Update canteen if provided
    if (canteen) groupOrder.canteen = canteen;

    let totalAmount = 0;
    const itemDetails = [];
    for (const item of items) {
      const dbItem = await Item.findById(item.item);
      if (dbItem) {
        totalAmount += dbItem.price * item.quantity;
        itemDetails.push({
          item: item.item,
          quantity: item.quantity,
          nameAtPurchase: dbItem.name,
          priceAtPurchase: dbItem.price
        });
      }
    }

    // FIXED here: assign enriched items instead of raw input items
    groupOrder.items = itemDetails;

    groupOrder.totalAmount = totalAmount;
    groupOrder.paymentDetails.splitType = splitType || 'equal';
    groupOrder.paymentDetails.amounts = amounts || groupOrder.members.map(member => ({
      user: member,
      amount: totalAmount / groupOrder.members.length
    }));
    groupOrder.paymentDetails.payer = payer || groupOrder.creator;
    groupOrder.paymentDetails.transactions = groupOrder.paymentDetails.transactions || [];

    // Create individual orders and transactions for each member
    const transactions = [];
    for (const amountEntry of groupOrder.paymentDetails.amounts) {
      const user = await User.findById(amountEntry.user);
      if (!user) continue; // Skip if user not found

      // Generate unique OrderNumber
      const orderNumber = `ORD-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

      // Create a new Order for the member's share
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

      // Check for existing transaction
      const existingTransaction = await Transaction.findOne({
        orderId: memberOrder._id,
        status: { $in: ["created", "attempted", "paid"] }
      });
      if (existingTransaction) {
        continue; // Skip if transaction already exists
      }

      // Generate a short, unique receipt (max 40 characters)
      const receiptBase = `${groupOrderId}_${amountEntry.user}`;
      const receiptHash = crypto.createHash('md5').update(receiptBase).digest('hex').slice(0, 8);
      const receipt = `grp_${groupOrderId.slice(-4)}_${receiptHash}`; // e.g., grp_89ab_1a2b3c4d

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(amountEntry.amount * 100), // Convert to paise
        currency: "INR",
        receipt: receipt,
        notes: {
          orderId: memberOrder._id.toString(),
          userId: amountEntry.user.toString(),
          groupOrderId: groupOrderId,
          canteenId: groupOrder.canteen.toString()
        }
      });

      // Create transaction record
      const transaction = await Transaction.create({
        orderId: memberOrder._id,
        userId: amountEntry.user,
        razorpayOrderId: razorpayOrder.id,
        amount: amountEntry.amount,
        currency: "INR",
        status: "created",
        paymentMethod: "upi"
      });

      // Update member order status
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
    }

    // Update group order status if transactions are initiated
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

exports.joinGroupOrder = async (req, res) => {
  try {
    const { link } = req.body;             // groupLink from client
    const userId = req.user._id;           // authenticated user, via auth middleware

    if (!link) {
      return res.status(400).json({ message: "Group link is required" });
    }

    // Find group order by groupLink
    const groupOrder = await GroupOrder.findOne({ groupLink: link });
    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    // Check if user is already a member
    if (groupOrder.members.includes(userId)) {
      return res.status(400).json({ message: "User already in group" });
    }

    // Add user to members array
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
    const { groupOrderId, items } = req.body;

    if (!groupOrderId || !items) {
      return res.status(400).json({ message: "Group Order ID and items are required." });
    }

    const groupOrder = await GroupOrder.findById(groupOrderId);

    if (!groupOrder) {
      return res.status(404).json({ message: "Group Order not found." });
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
