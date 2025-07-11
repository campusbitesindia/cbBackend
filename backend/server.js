const dotenv = require("dotenv");
const {connectDB} = require("./config/database");
const app=require("../backend/app")
dotenv.config({path: "./config/config.env"});


app.listen(process.env.port, ()=>{
    console.log(`Server is up on port: ${process.env.port}`);
})
connectDB();