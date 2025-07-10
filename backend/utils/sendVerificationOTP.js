const sendEmailVerificationModel= require("../models/emailVerification");
const nodemailer=require("nodemailer");
const sendEmailVerificationOTP=async (req, user)=>{
    const otp=Math.floor(1000 + Math.random()*9000);
    await new sendEmailVerificationModel({userId: user._id, otp:otp}).save();
    const otpVerificationLink = `${process.env.FRONTEND_HOST}/account/verify-email`;
    let transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    })
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "OTP for Account verification",
        html: `<p>Dear ${user.name},</p><p>Thank you for signing up with Hotel Manager. To complete you registration, please verify your email address by entering the following one-time-password (OTP): ${otpVerificationLink}</p><h2>OTP: ${otp}</h2>`
    })
    return otp;
}
module.exports= sendEmailVerificationOTP;