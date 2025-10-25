import nodemailer from 'nodemailer';


export const sendMail = async (to, otp) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAILPASS,

        }
    });

    const mailOptions = {
        from: `Villager Clothing ${process.env.EMAIL}`,
        to,
        subject: "verify your email",
        html: `
    <p>Hello</p>
          <p>Your verification code is: <strong>${otp}</strong></p>
                <p>This code will expire in 10 minutes.</p>


    `
    }

await transporter.sendMail(mailOptions);

}