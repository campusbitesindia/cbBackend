const mongoose = require("mongoose")
const Transaction = require("../models/Transaction")
require("dotenv").config()

const setupIndexes = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Create indexes for Transaction model
    await Transaction.collection.createIndex({ orderId: 1 })
    await Transaction.collection.createIndex({ userId: 1 })
    await Transaction.collection.createIndex({ razorpayOrderId: 1 })
    await Transaction.collection.createIndex({ razorpayPaymentId: 1 })
    await Transaction.collection.createIndex({ status: 1 })
    await Transaction.collection.createIndex({ createdAt: -1 })
    await Transaction.collection.createIndex({ "refund.refundId": 1 })

    console.log("Payment indexes created successfully")

    // Close connection
    await mongoose.connection.close()
    console.log("Database connection closed")
  } catch (error) {
    console.error("Error setting up indexes:", error)
    process.exit(1)
  }
}

setupIndexes()
