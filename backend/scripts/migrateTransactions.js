const mongoose = require("mongoose")
const Transaction = require("../models/Transaction")
const Order = require("../models/Order")
require("dotenv").config()

const migrateTransactions = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Find all orders that don't have corresponding transactions
    const ordersWithoutTransactions = await Order.find({
      paymentStatus: "paid",
      _id: {
        $nin: await Transaction.distinct("orderId"),
      },
    })

    console.log(`Found ${ordersWithoutTransactions.length} orders without transactions`)

    // Create transactions for these orders
    for (const order of ordersWithoutTransactions) {
      const transaction = new Transaction({
        orderId: order._id,
        userId: order.userId,
        razorpayOrderId: `migrated_${order._id}_${Date.now()}`,
        amount: order.totalAmount,
        currency: "INR",
        status: "paid",
        paymentMethod: "unknown",
        paidAt: order.paidAt || order.createdAt,
        metadata: {
          migrated: "true",
          originalOrderId: order._id.toString(),
        },
      })

      await transaction.save()
      console.log(`Created transaction for order: ${order._id}`)
    }

    console.log("Transaction migration completed")

    // Close connection
    await mongoose.connection.close()
    console.log("Database connection closed")
  } catch (error) {
    console.error("Error migrating transactions:", error)
    process.exit(1)
  }
}

// Run the migration
migrateTransactions()
