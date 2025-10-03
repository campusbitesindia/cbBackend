const sendEmailVerificationModel = require("../models/emailVerification");
const { Resend } = require("resend"); // Correct import

// Use environment variable for API key instead of hardcoding
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmailVerificationOTP = async (req, user) => {
    try {
        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000);

        // Save OTP to database
        await new sendEmailVerificationModel({ userId: user._id, otp }).save();

        // Verification link
        const otpVerificationLink = `${process.env.FRONTEND_HOST.replace(/\/$/, '')}/account/verify-email/${user.email}`;

        // HTML email content
        const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; padding: 32px;">
          <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden;">
            <div style="background: linear-gradient(90deg, #ff5858 0%, #f09819 100%); padding: 24px 0; text-align: center;">
              <img src='https://campusbites.in/logo.png' alt='Campus Bites Logo' style='height: 48px; margin-bottom: 8px;' />
              <h1 style="color: #fff; font-size: 2rem; margin: 0; letter-spacing: 1px;">Campus Bites</h1>
            </div>
            <div style="padding: 32px 24px 24px 24px;">
              <h2 style="color: #222; font-size: 1.25rem; margin-bottom: 8px;">Welcome, ${user.name}!</h2>
              <p style="color: #444; font-size: 1rem; margin-bottom: 24px;">Thank you for signing up with <b>Campus Bites</b>.<br/>To complete your registration, please verify your email address using the OTP below:</p>
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; font-size: 2.5rem; font-weight: bold; letter-spacing: 8px; color: #ff5858; background: #f6f8fa; border-radius: 8px; padding: 12px 32px; border: 1px solid #eee;">${otp}</span>
              </div>
              <p style="color: #666; font-size: 1rem; margin-bottom: 16px;">Or click the button below to verify your email:</p>
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${otpVerificationLink}" style="display: inline-block; background: linear-gradient(90deg, #ff5858 0%, #f09819 100%); color: #fff; font-weight: 600; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 1.1rem; letter-spacing: 1px;">Verify Email</a>
              </div>
              <p style="color: #999; font-size: 0.95rem;">If you did not sign up for Campus Bites, you can safely ignore this email.<br/>This OTP is valid for 10 minutes.</p>
            </div>
            <div style="background: #f6f8fa; color: #aaa; text-align: center; font-size: 0.9rem; padding: 16px 0; border-top: 1px solid #eee;">
              &copy; ${new Date().getFullYear()} Campus Bites. All rights reserved.
            </div>
          </div>
        </div>
        `;

        // Send email via Resend API
        await resend.emails.send({
            from: "Campus Bites <no-reply@campusbites.in>",
            to: user.email,
            subject: "Campus Bites - Verify Your Email Address (OTP Inside)",
            html,
        });

        return otp;

    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Unable to send verification email. Please try again later.");
    }
};

module.exports = sendEmailVerificationOTP;
