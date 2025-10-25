
import mongoose from "mongoose";

const Schema = mongoose.Schema;


const cartItemSchema = new Schema({

    productId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    name: {
        type: String,
        required: true,
       
    },
    price: {
        type: Number,
        required: true,
       
    },
    img: {
        type: String,
        required: true,
       
    },
 

});

const addressSchema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true }

})


const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },

    phoneNo: {
        type: Number,
       
    },
    emailVerified:{
        type:Boolean,
        default:false
    },
    phoneNoVerified:{
        type:Boolean,
        default:false
    },
    cart: [cartItemSchema],
    address: [addressSchema],
    recentOrders:[
    {
        type:Schema.Types.ObjectId,
        ref:"Order"
    }
    ]

}, { timestamps: true });

export const userModel = mongoose.model('users', userSchema);