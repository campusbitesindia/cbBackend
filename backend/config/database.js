const mongoose=require("mongoose");

exports.connectDB=()=>{
mongoose.connect(process.env.db_uri).then((data)=>{
    console.log(`MongoDB connected to host: ${data.connection.host}`);
}).catch((err)=>{
    console.log(`Error: ${err}`);
})
}