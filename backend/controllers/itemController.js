const Item = require('../models/Item')

// GET all items for canteen
exports.getItems = async (req, res) => {
    try {
        const items = await Item.find({ canteen: req.params.canteenId });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// works

// POST create item
exports.createItem = async (req, res) => {
    try {
        const item = await Item.create(req.body);
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
};
// works

// PUT update item
exports.updateItem = async (req, res) => {
    try {
        const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.json(item)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}
// works

// DELETE item
exports.deleteItem = async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id)
        res.json({ message: 'Item deleted' })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}
// works