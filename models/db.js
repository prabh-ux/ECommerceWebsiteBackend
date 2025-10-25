import mongoose from "mongoose";

const mongoUrl=process.env.MONGO_DB_URL;

mongoose.connect(mongoUrl).then(()=>console.log("database connected sucessfully")).catch((err)=>console.log(err));