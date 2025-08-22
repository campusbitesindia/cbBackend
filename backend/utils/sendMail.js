const nodeMailer=require("nodemailer");


exports.sendMail=async(email,title,body)=>{
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
            to: email,
            subject: title,
            html: body
        }
        await transporter.sendMail(mailOptions);
}