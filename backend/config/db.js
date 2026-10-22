const mongoose = require("mongoose")

const connectDB = async () =>{
    try{
        if(!process.env.MONGODB_URI){
            throw new Error("MONGODB_URI is missing in .env file")
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected Sucessfully!");
    } catch(error){
        console.log("MongoDB Connection Failed:", error.message)
        process.exit(1); 
    }
};
module.exports = connectDB;