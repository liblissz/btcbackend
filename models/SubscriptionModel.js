import mongoose from "mongoose";


const subscribeschema = new  mongoose.Schema(
    {
        Email:{type: String, required: true}
    },
    {timestamps: true},
)

const subscribemodel =  mongoose.model("Subscriber", subscribeschema)

export default subscribemodel