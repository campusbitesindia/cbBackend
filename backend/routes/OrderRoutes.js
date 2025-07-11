const express=require("express");
const { CreateOrder, UpdateOrderStatus, getAllOrdersByStudent, getAllOrdersByCanteen, getOrderDetails, deleteOrder, GetallDeletedOrders } = require("../controllers/orderControllers");
const { isAuthenticated, isStudent, isVendor } = require("../middleware/auth");
const {smartLoginMonitoring}=require("../middleware/smartSecurity")
const router=express.Router();


router.post("/CreateOrder",isAuthenticated,isStudent,smartLoginMonitoring,CreateOrder);
router.post("/ChangeStatus/:id",isAuthenticated,smartLoginMonitoring,UpdateOrderStatus);
router.get("/getStudentAllOrders",isAuthenticated,isStudent,getAllOrdersByStudent);
router.get("/getCanteenAllOrders",isAuthenticated,isVendor,getAllOrdersByCanteen);
router.get("/getOrderDetails/:id",isAuthenticated,getOrderDetails)
router.delete("/deleteOrder/:id",isAuthenticated,deleteOrder);
router.get("/getDeletedOrders",isAuthenticated,GetallDeletedOrders)
module.exports=router;