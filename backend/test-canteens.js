const mongoose = require("mongoose");
require("dotenv").config({ path: "./config/config.env" });

// Simple test to add one canteen
async function testCanteens() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if Canteen collection exists
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("📁 Available collections:", collections.map(c => c.name));

    // Create a simple canteen document directly
    const canteenData = {
      name: "Test Cafeteria",
      campus: new mongoose.Types.ObjectId(), // Dummy ObjectId
      owner: new mongoose.Types.ObjectId(),  // Dummy ObjectId
      cuisine: "Multi-Cuisine",
      rating: 4.5,
      deliveryTime: "20-30 min",
      distance: "On Campus",
      featured: true,
      discount: "20% OFF",
      description: "Test canteen for debugging",
      images: ["/placeholder.jpg"],
      isOpen: true,
      isDeleted: false
    };

    // Insert directly into canteens collection
    const result = await db.collection('canteens').insertOne(canteenData);
    console.log("✅ Inserted canteen with ID:", result.insertedId);

    // Query all canteens
    const canteens = await db.collection('canteens').find({ isDeleted: false }).toArray();
    console.log("📋 Total canteens:", canteens.length);
    canteens.forEach((canteen, index) => {
      console.log(`${index + 1}. ${canteen.name} - ${canteen.cuisine}`);
    });

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testCanteens(); 