import mongoose from "mongoose";


const Schema=mongoose.Schema;


const optSchema=new Schema({

    userId:{
        type:Schema.Types.ObjectId,ref:"user",required:true
    },
    otpHash:{
        type:String,required:true
    },
    expiresAt:{
        type:Date,required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

optSchema.index({expiresAt:1},{expireAfterSeconds:0});

export const optModel=mongoose.model("opt",optSchema);