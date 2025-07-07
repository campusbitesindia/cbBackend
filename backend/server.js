const app = require("./app");
const dotenv = require("dotenv");
const {connectDB} = require("./config/database");

//Load env
dotenv.config({path: "./config/config.env"});

//Connect to DB
connectDB();

//Start server
app.listen(process.env.port, ()=>{
    console.log(`Server is up on port: ${process.env.port}`);
})