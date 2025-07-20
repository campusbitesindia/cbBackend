const express = require('express');
const router = express.Router();
const {
  getItems,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');
const { isAuthenticated, isVendor } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

router.get('/getItems/:id', getItems);
router.post('/CreateItem', upload.single('ItemThumbnail'), createItem);
router.put(
  '/updateItem/:id',
  isAuthenticated,
  isVendor,
  upload.single('ItemThumbnail'),
  updateItem
);
router.delete('/deleteItem/:id', isAuthenticated, isVendor, deleteItem);

module.exports = router;
