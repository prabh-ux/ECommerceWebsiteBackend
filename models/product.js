import mongoose from "mongoose";

const Schema = mongoose.Schema;


const RecentOrdersSchema = new Schema({

    productId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },

    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },



});

export const recentOrderModel=mongoose.model("recentProducts",RecentOrdersSchema);