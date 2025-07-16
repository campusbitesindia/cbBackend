const Order = require("../models/Order");
const Item = require("../models/Item");
const User = require("../models/User");
const mongoose = require("mongoose");
const Canteen = require('../models/Canteen');

exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId).populate("campus");
        if (!user) return res.status(404).json({ message: "User not found" });

        const personalItems = await Order.aggregate([
            { $match: { student: user._id } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.item",
                    count: { $sum: "$items.quantity" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: "items",
                    localField: "_id",
                    foreignField: "_id",
                    as: "itemInfo"
                }
            },
            { $unwind: "$itemInfo" },
            {
                $project: {
                    name: "$itemInfo.name",
                    count: 1,
                    image: "$itemInfo.images",
                    price: "$itemInfo.price"
                }
            }
        ]);

        const trendingCampusItems = await Order.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "student",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            { $unwind: "$userInfo" },
            { $match: { "userInfo.campus": user.campus._id } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.item",
                    count: { $sum: "$items.quantity" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: "items",
                    localField: "_id",
                    foreignField: "_id",
                    as: "itemInfo"
                }
            },
            { $unwind: "$itemInfo" },
            {
                $project: {
                    name: "$itemInfo.name",
                    count: 1,
                    image: "$itemInfo.images",
                    price: "$itemInfo.price"
                }
            }
        ]);

        const globalTopItems = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.item",
                    count: { $sum: "$items.quantity" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: "items",
                    localField: "_id",
                    foreignField: "_id",
                    as: "itemInfo"
                }
            },
            { $unwind: "$itemInfo" },
            {
                $project: {
                    name: "$itemInfo.name",
                    count: 1,
                    image: "$itemInfo.images",
                    price: "$itemInfo.price"
                }
            }
        ]);


        return res.status(200).json({
            success: true,
            message: "Recommendation generated",
            data: {
                personalItems,
                trendingCampusItems,
                globalTopItems
            }
        });

    } catch (err) {
        console.error("Recommendation Error", err);
        res.status(500).json({ message: "Server error" });
    }
};


exports.peopleAlsoOrdered = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const objectId = new mongoose.Types.ObjectId(itemId);
    const result = await Order.aggregate([
      { $match: { "items.item": objectId } },

      { $unwind: "$items" },

      { $match: { "items.item": { $ne: objectId } } },

      {
        $group: {
          _id: "$items.item",
          count: { $sum: "$items.quantity" },
        },
      },

      { $sort: { count: -1 } },

      // Limit to top 5
      { $limit: 5 },

      // Join with Item collection to get item details
      {
        $lookup: {
          from: "items",
          localField: "_id",
          foreignField: "_id",
          as: "itemInfo",
        },
      },
      { $unwind: "$itemInfo" },

      {
        $project: {
          itemId: "$_id",
          name: "$itemInfo.name",
          price: "$itemInfo.price",
          images: "$itemInfo.images",
          count: 1,
        },
      },
    ]);
    return res.status(200).json({
      success: true,
      message: "Top items ordered with this item",
      items: result,
    });
  } catch (error) {
    console.error("People Also Ordered Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.searchAll = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json({ results: {} });

    // Search canteens
    const canteens = await Canteen.find({
      isDeleted: false,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { cuisine: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
    })
      .select('name location _id')
      .limit(5);

    // Search items
    const items = await Item.find({
      isDeleted: false,
      available: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
    })
      .select('name price _id')
      .limit(8);

    res.json({
      results: {
        canteen: canteens.map(c => ({ ...c.toObject(), type: 'canteen' })),
        item: items.map(i => ({ ...i.toObject(), type: 'item' })),
      },
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
};
