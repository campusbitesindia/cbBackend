  const Offer = require("../models/Offer");

  exports.CreateOffer = async (req, res) => {
    try {
      const { description, MaxValue, MinValue, discount, isUnique, MaxDiscount } =
        req.body;
      if (
        !description ||
        !MaxValue ||
        !MinValue ||
        !discount ||
        isUnique == undefined ||
        !MaxDiscount
      ) {
        return res.status(400).json({
          success: false,
          message: "Please enter all the details",
        });
      }

      const newOffer = await Offer.create({
        description,
        MaxValue,
        MinValue,
        discount,
        isUnique,
        MaxDiscount,
      });
      return res.status(200).json({
        success: true,
        message: "Offer Coupon Created SuccessFully",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "internal server error",
        error: err.message,
      });
    }
  };

  exports.getActiveOffer = async (req, res) => {
    try {
      const Offers = await Offer.find({ isActive: true });
      if (Offers.length == 0 || !Offers) {
        return res.status(400).json({
          success: false,
          message: "No Active Offer",
          data: [],
        });
      }

      return res.status(200).json({
        success: true,
        message: "Offers fetched SuccessFully",
        data: Offers,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "internal server error",
        error: err.message,
      });
    }
  };

  exports.getAllOffers = async (req, res) => {
    try {
      const Offers = await Offer.find({});
      if (!Offers || Offers.length === 0) {
        return res.status(500).json({
          success: false,
          message: "No Offer found",
          data: [],
        });
      }

      return res.status(200).json({
        success: true,
        message: "Offers fetched successFully",
        data: Offers,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "internal server error",
        error: err.message,
      });
    }
  };

  exports.UpdateOffer = async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Id not found",
        });
      }

      if (!data) {
        return res.status(400).json({
          success: false,
          message: "please send required data",
        });
      }
      const offer = await Offer.findById(id);
      if (!offer) {
        return res.status(400).json({
          success: false,
          message: "No offer found with this id",
        });
      }

      for (const key in data) {
        offer[key] = data[key];
      }
      await offer.save();
      return res.status(200).json({
        success: true,
        message: "Offer updated SuccessFully",
        data: offer,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "internal server error",
        error: err.message,
      });
    }
  };
