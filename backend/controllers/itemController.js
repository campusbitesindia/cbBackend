const Item = require('../models/Item');
const Canteen = require('../models/Canteen');
const cloudinary = require('cloudinary').v2;
// GET all items for canteen
exports.getItems = async (req, res) => {
  try {
    const { id: canteenId } = req.params;
    if (!canteenId) {
      return res.status(400).json({
        success: false,
        message: 'CanteenId not found',
      });
    }
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(400).json({
        success: false,
        message: 'caneen not found',
      });
    }
    const Items = await Item.find({ canteen: canteen._id,isDeleted:false });
    return res.status(200).json({
      success: true,
      message: 'Items Fetched SuccessFully',
      data: Items,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// works

// POST create item
exports.createItem = async (req, res) => {
  try {
    const { name, price, canteenId,available,description,isVeg,category,quantity,portion } = req.body;
    console.log(name, price, canteenId,available,description,isVeg,category,quantity,portion )
    const Image = req.file;
   console.log(Image)
    if (!name || !price || !canteenId || !Image || !available || !description || !isVeg || !category || !quantity || !portion ) {
      return res.status(400).json({
        success: false,
        message: 'name ,price,Image or canteenId is missing',
      });
    }

    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(400).json({
        success: false,
        message: 'canteen not found',
      });
    }
    const uploaded = await cloudinary.uploader.upload(Image.path, {
      resource_type: 'auto',
      folder: process.env.ItemsFolder,
    });
    const item =await  Item.create({
      name,
      price,
      canteen: canteen._id,
      image: uploaded.secure_url,
      available,description,isVeg,category,quantity,portion 
    });
    return res.status(200).json({
      success: true,
      message: 'Item created SuccessFully',
      data: item,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'internal server error',
      error: err.message,
    });
  }
};
// works

// PUT update item
exports.updateItem = async (req, res) => {
  try {
    const data = req.body;
    const { id: itemId } = req.params;
    const file = req.file;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(400).json({
        success: false,
        message: 'Item not found',
      });
    }

    for (const key in data) {
      if (item[key] != data[key]) {
        item[key] = data[key];
      }
    }
    if (file) {
      const uploadedImage = await cloudinary.uploader.upload(file.path, {
        resource_type: 'auto',
        folder: process.env.ItemsFolder,
      });
      item.image = uploadedImage.secure_url;
    }
    await item.save();
    return res.status(200).json({
      success:true,
      message: 'item Updated SuccessFully',
      data: item,
    });
  } catch (err) {
    
    res.status(500).json({ success:false, error: err.message });
  }
};
// works

// DELETE item
exports.deleteItem = async (req, res) => {
  try {
    const { id: ItemId } = req.params;
    if (!ItemId) {
      return res.status(400).json({
        success: false,
        messaeg: 'ItemId not Found',
      });
    }
    const item = await Item.findByIdAndUpdate(
      ItemId,
      { isDeleted: true },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      messaege: 'Item deleted SuccessFully',
      data: {},
    });
  } catch (err) {
    res.status(500).json({success:false, error: err.message });
  }
};
// works
exports.getItemsUnder99 = async (req, res) => {
    try {
        const { id: canteenId } = req.params;
        if (!canteenId) {
            return res.status(400).json({
                success: false,
                message: "CanteenId not found"
            });
        }
        const canteen = await Canteen.findById(canteenId);
        if (!canteen) {
            return res.status(400).json({
                success: false,
                message: "Canteen not found"
            });
        }
        const items = await Item.find({ canteen: canteen._id, price: { $lte: 99 } });
        return res.status(200).json({
            success: true,
            message: "Items under 99 fetched successfully",
            data: items
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getItemsByPriceRange = async (req, res) => {
    try {
        const { id: canteenId } = req.params;
        const { minPrice, maxPrice } = req.body;

        if (!canteenId) {
            return res.status(400).json({
                success: false,
                message: "CanteenId not found"
            });
        }
        if (!minPrice || !maxPrice) {
            return res.status(400).json({
                success: false,
                message: "Min price and max price are required"
            });
        }

        const canteen = await Canteen.findById(canteenId);
        if (!canteen) {
            return res.status(400).json({
                success: false,
                message: "Canteen not found"
            });
        }

        const items = await Item.find({
            canteen: canteen._id,
            price: { $gte: Number(minPrice), $lte: Number(maxPrice) },
        });

        return res.status(200).json({
            success: true,
            message: "Items fetched successfully within price range",
            data: items
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getReadyItems = async (req, res) => {
    try {
        const { id: canteenId } = req.params;
        if (!canteenId) {
            return res.status(400).json({
                success: false,
                message: "CanteenId not found"
            });
        }
        const canteen = await Canteen.findById(canteenId);
        if (!canteen) {
            return res.status(400).json({
                success: false,
                message: "Canteen not found"
            });
        }
        const items = await Item.find({ canteen: canteen._id, isReady: true });
        return res.status(200).json({
            success: true,
            message: "Ready items fetched successfully",
            data: items
        });
    } catch (err) {
        res.status(500).json({success:false,
           error: err.message });
    }
};

exports.toggleItemReadyStatus = async (req, res) => {
    try {
        const { id: itemId } = req.params;
        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "ItemId not found"
            });
        }
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(400).json({
                success: false,
                message: "Item not found"
            });
        }
        item.isReady = !item.isReady;
        await item.save();
        return res.status(200).json({
            success: true,
            message: `Item ${item.isReady ? 'marked as ready' : 'marked as not ready'}`,
            data: item
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getReadyItemsofAllCanteens = async (req, res) => {
  try {
    const { campus } = req.query;

    if (!campus) {
      return res.status(400).json({
        success: false,
        message: "Campus ID not found"
      });
    }

    const canteens = await Canteen.find({ campus, isApproved: true });

    if (!canteens || canteens.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No canteen found in campus"
      });
    }

    const itemPromises = canteens.map(canteen =>
      Item.find({ canteen: canteen._id, isReady: true }).populate("canteen")
    );

    const itemsNested = await Promise.all(itemPromises);

    // Flatten the nested array of arrays
    const items = itemsNested.flat();

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items found in ready state"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Items fetched",
      data: items
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};
