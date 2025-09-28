const axios = require("axios");
const crypto = require("crypto");
const dotenv = require("dotenv");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
dotenv.config();

const config = {
  merchantId: process.env.MerchantId,
  saltKey: process.env.SaltKey,
  saltIndex: process.env.SaltIndex,
  baseUrl: process.env.BaseUrl
};


exports.createPaymentPhonePe = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const amount = order.total;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid amount" });
    }

    const merchantTransactionId = crypto.randomUUID();
    const merchantUserId = "USER_" + Date.now();

    const payload = {
      merchantId: config.merchantId,
      merchantTransactionId,
      merchantUserId,
      amount: parseInt(amount) * 100, // convert to paise
      redirectUrl: `${process.env.FRONTEND_HOST}/student/orders?transactionId=${merchantTransactionId}`,
      redirectMode: "REDIRECT",
      callbackUrl: `${process.env.Backend_HOST}/payments/callback`,
      paymentInstrument: { type: "PAY_PAGE" }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const stringToHash = base64Payload + "/pg/v1/pay" + config.saltKey;
    const sha256Hash = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const xVerify = sha256Hash + "###" + config.saltIndex;

    const response = await axios.post(
      `${config.baseUrl}/pg/v1/pay`,
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          accept: "application/json"
        }
      }
    );

    return res.json({
      success: true,
      checkOutPageUrl: response.data.data.instrumentResponse.redirectInfo.url,
      merchantTransactionId
    });
  } catch (error) {
    console.error("Create payment error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
};

exports.verifyPayments = async (req, res) => {
  try {
    const { id: transactionId } = req.params;

    const stringToHash = `/pg/v1/status/${config.merchantId}/${transactionId}` + config.saltKey;
    const sha256Hash = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const xVerify = sha256Hash + "###" + config.saltIndex;

    const response = await axios.get(
      `${config.baseUrl}/pg/v1/status/${config.merchantId}/${transactionId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          accept: "application/json"
        }
      }
    );

    const paymentStatus = response.data.data?.state || "FAILED";

    return res.json({
      success: true,
      status: paymentStatus,
      data: response.data
    });
  } catch (error) {
    console.error("Verify payment error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
};


exports.paymentCallback = async (req, res) => {
  try {
    const { id: transactionId } = req.params;
    const paymentData = req.body;

    console.log("PhonePe Callback:", paymentData);

    // Verify status (same as verifyPayments)
    const stringToHash = `/pg/v1/status/${config.merchantId}/${transactionId}` + config.saltKey;
    const sha256Hash = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const xVerify = sha256Hash + "###" + config.saltIndex;

    const response = await axios.get(
      `${config.baseUrl}/pg/v1/status/${config.merchantId}/${transactionId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          accept: "application/json"
        }
      }
    );

    const status = response.data.data?.state;

    if (status === "COMPLETED") {
      // ✅ Update Order & Transaction
      await Order.findOneAndUpdate(
        { _id: paymentData.orderId },
        { $set: { paymentStatus: "PAID" } }
      );

      await Transaction.create({
        order: paymentData.orderId,
        transactionId,
        amount: response.data.data.amount / 100,
        status: "SUCCESS"
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Callback error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
};
