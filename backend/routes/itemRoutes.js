const express = require('express')
const router = express.Router()
const { getItems, createItem, updateItem, deleteItem, getItemsUnder99, getItemsByPriceRange, getReadyItems, toggleItemReadyStatus, getReadyItemsofAllCanteens } = require('../controllers/itemController')
const{ isAuthenticated, isVendor }=require("../middleware/auth");
const upload = require('../middleware/uploadMiddleware');

router.get('/getItems/:id', getItems);
router.post('/CreateItem',isAuthenticated,isVendor,upload.single('ItemThumbnail'), createItem)
router.put('/updateItem/:id',isAuthenticated,isVendor,upload.single('ItemThumbnail'), updateItem)
router.delete('/deleteItem/:id',isAuthenticated,isVendor,deleteItem)
router.route("/under99/:id").get(getItemsUnder99);
router.route("/range/:id").get(getItemsByPriceRange);
router.route("/ready/:id").get(getReadyItems);
router.route("/toggle-ready/:id").put(toggleItemReadyStatus);
router.get("/allReadyItems",getReadyItemsofAllCanteens);
module.exports = router; 
 