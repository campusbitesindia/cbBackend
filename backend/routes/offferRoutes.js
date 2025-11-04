const express=require("express");
const { isAuthenticated, isAdmin }=require("../middleware/auth")
const { CreateOffer, UpdateOffer, getActiveOffer, getAllOffers }=require("../controllers/OfferControllers");
const router=express.Router();

router.post ("/create",isAuthenticated,isAdmin,CreateOffer);
router.put("/update/:id",isAuthenticated,isAdmin,UpdateOffer);
router.get("/getAllOffers",isAuthenticated,isAdmin,getAllOffers);
router.get("/getActiveOffer",getActiveOffer);

module.exports=router;