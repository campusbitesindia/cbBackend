const express=require("express");
const { CreateOrder, UpdateOrderStatus, getAllOrdersByStudent, getAllOrdersByCanteen, getOrderDetails, deleteOrder, GetallDeletedOrders } = require("../controllers/orderControllers");
const { isAuthenticated } = require("../middleware/auth");
const router=express.Router();


router.post("/CreateOrder",isAuthenticated,CreateOrder);
router.post("/ChangeStatus/:id",isAuthenticated,UpdateOrderStatus);
router.get("/getStudentAllOrders",isAuthenticated,getAllOrdersByStudent);
router.get("/getCanteenAllOrders",isAuthenticated,getAllOrdersByCanteen);
router.get("/getOrderDetails/:id",isAuthenticated,getOrderDetails)
router.delete("/deleteOrder/:id",isAuthenticated,deleteOrder);
router.get("/getDeletedOrders",isAuthenticated,GetallDeletedOrders);
module.exports=router;