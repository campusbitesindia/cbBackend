const nodeMailer=require("nodemailer");

const sendEmail= async(options)=>{
    const transporter=nodeMailer.createTransport({
        host:process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    })
    const mailOptions={
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: "Forget Password verification link",
        html: options.message
    }
    await transporter.sendMail(mailOptions);
}

module.exports=sendEmail;