const app = require("./app");
const dotenv = require("dotenv");
const {connectDB} = require("./config/database");
const AuthRoutes=require("./routes/userRoutes")
const OrderRoutes =require("./routes/OrderRoutes");
dotenv.config({path: "./config/config.env"});


app.use("/auth",AuthRoutes)
app.use("/order",OrderRoutes)
 
app.listen(process.env.port, ()=>{
    console.log(`Server is up on port: ${process.env.port}`);
})
connectDB();