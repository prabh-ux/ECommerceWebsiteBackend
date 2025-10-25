import { Router } from "express";
import { addAddress, addProductToCart, fetchCartProducts, fetchProducts, fetchRecentOrders, fetchSingleProd, payment, removeProduct, search, submitReview, updateAddress, updateCart } from "../controllers/productsController.js";
import { jwtVerify } from "../middleware/jwtVerify.js";


const router=Router();

router.get('/getproducts',jwtVerify, fetchProducts);
router.post('/addtocart',jwtVerify,addProductToCart);
router.patch('/updatecart',jwtVerify,updateCart);
router.delete('/deletefromcart',jwtVerify,removeProduct)
router.get('/getcartproducts',jwtVerify,fetchCartProducts);
router.post('/addaddress',jwtVerify,addAddress);
router.patch('/updateAddress',jwtVerify,updateAddress);
router.post("/search",jwtVerify,search);
router.post("/payment",jwtVerify,payment);
router.get("/fetchrecentorders",jwtVerify,fetchRecentOrders);
router.post("/fetchsingleprod",jwtVerify,fetchSingleProd);
router.post("/submitcomment",jwtVerify,submitReview);


export default router;