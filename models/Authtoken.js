import mongoose from 'mongoose'

   const tokenschema = mongoose.Schema(
    {
        useremail: {
            type: String,
            required: true
        },
          token: {
            type: String,
            required: true
        }
    },
    {timestamp: true}
   )

   const tokenmodel = await mongoose.model("userstoken", tokenschema)

   export default tokenmodel;