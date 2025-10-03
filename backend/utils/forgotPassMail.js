const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Campus Bites <no-reply@campusbites.in>", // e.g. "Your App <onboarding@resend.dev>"
      to: options.email,            // recipient email
      subject: "Forget Password verification link",
      html: options.message,        // HTML body
    });

    if (error) {
      console.error("Email sending error:", error);
      throw new Error(error.message);
    }

    console.log("Email sent successfully:", data);
    return data;
  } catch (err) {
    console.error("Error in sendEmail:", err);
    throw err;
  }
};

module.exports = sendEmail;
