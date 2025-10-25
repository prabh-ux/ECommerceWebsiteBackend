import { Router } from "express";
import { checkStatus, checkverification, fetchUserDetails, handleLogout, Login, sendEmailOtp, Signup, verifyEmailOtp } from "../controllers/authController.js";
import { loginValidator, signUpValidator } from "../middleware/authMiddleWare.js";
import { jwtVerify } from "../middleware/jwtVerify.js";

const router=Router();

router.post('/login',loginValidator,Login);
router.post('/signup',signUpValidator,Signup);
router.get('/check',jwtVerify,checkStatus);
router.get('/fetchuser',jwtVerify,fetchUserDetails);
router.post('/sendemailotp',jwtVerify,sendEmailOtp);
router.post('/verifyemailotp',jwtVerify,verifyEmailOtp);
router.get('/checkverification',jwtVerify,checkverification);
router.post('/logout',jwtVerify,handleLogout);


export default router;