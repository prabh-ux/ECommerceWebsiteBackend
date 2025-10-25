import { userModel } from "../models/user.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateopt } from "../utils/generateOtp.js";
import { optModel } from "../models/otpModel.js";
import { sendMail } from "../utils/sendMail.js";
const SALT_ROUNDS = 10;
const OTP_EXPIRATION_MINUTES = 10;
export const Login = async (req, res) => {

    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(401).json({ msg: "No user found with these credentials" });
    }

    const passwordEqual = await bcrypt.compare(password, user.password);

    if (!passwordEqual) {
        return res.status(401).json({ msg: "email or password incorrect" });

    }
    const token = jwt.sign(
        { email: user.email, id: user.id, name: user.name, phoneNo: user.phoneNo, emailVerified: user.emailVerified ,address:user.address},
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    )

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,           // ✅ good for localhost
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({ msg: "login successfull" });

}



export const Signup = async (req, res) => {

    const { name, email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (user) {
        return res.status(400).json({ msg: "email already registered" });
    }
    const newUser = new userModel({ name, email, password });
    newUser.password = await bcrypt.hash(password, 10);
    await newUser.save();


    const token = jwt.sign(
        { email: newUser.email, name: newUser.name, id: newUser._id, phoneNo: newUser.phoneNo, emailVerified: newUser.emailVerified,address:newUser.address },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    )

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,           // ✅ good for localhost
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({ msg: "signup  successfull" });

}

export const checkStatus = async (req, res) => {

    if (!req.user) {
        return res.json({ loggedIn: false });
    }
    return res.status(200).json({ loggedIn: true });


}
export const fetchUserDetails = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ msg: "unauthorized user" });
        }

        const updateduser=await userModel.findById(req.user.id);

        return res.status(200).json({ user: updateduser });

    } catch (error) {
        return res.status(500).json({ msg: "failed to fetch user details",error });
    }
}


export const sendEmailOtp = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ msg: "UnAuthorized user" });

        }
        const otp = generateopt();
        const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
        const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

        await optModel.create({ userId: userId, otpHash, expiresAt });
        await sendMail(user.email, otp);
        res.json({ message: "OTP sent to your email." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }

}

export const verifyEmailOtp = async (req, res) => {
    try {


        const userId = req.user.id;
        const { otp } = req.body;
        const user = await userModel.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ msg: "UnAuthorized user" });

        }

        const otpRecord = await optModel.findOne({ userId });

        if (!otpRecord) {
            return res.status(400).json({ message: "No OTP found. Please request again." });

        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid OTP" });

        }

        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ message: "OTP expired" });

        }

        await userModel.findByIdAndUpdate(userId, { emailVerified: true });
        await optModel.deleteMany({ userId });

        res.json({ message: "Email verified successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}
export const handleLogout = async (req, res) => {
    try {

        const userId = req.user.id;

        const user = await userModel.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ msg: "UnAuthorized user" });

        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: true, // true in production (HTTPS)
            sameSite: "None",
        });


        res.json({ message: "Logout Completed!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}
export const checkverification = async (req, res) => {
    try {


        const userId = req.user.id;

        const user = await userModel.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ msg: "UnAuthorized user" });

        }

        res.json({ message: "verificaton checked!", status: user.emailVerified });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}