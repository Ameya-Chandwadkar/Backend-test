import mongoose from "mongoose";

const connectdb=async()=>{
    try {
        const connectioInstance= await mongoose.connect
        (`${process.env.MONGO_URI}`)
        console.log(`MongoDB connected
            ${connectioInstance.connection.host}`)
        
    } catch (error) {
        console.log("Connection failed",error)
        process.exit(1)
    }
}
    export default connectdb