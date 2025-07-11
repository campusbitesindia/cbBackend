const mongoose=require("mongoose");

exports.connectDB=()=>{
mongoose.connect(process.env.DB_URI).then((data)=>{
    console.log(`MongoDB connected to host: ${data.connection.host}`);
}).catch((err)=>{
    console.log(`Error: ${err}`);
})
}