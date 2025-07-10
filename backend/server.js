const app = require("./app");
const dotenv = require("dotenv");
const {connectDB} = require("./config/database");

dotenv.config({path: "./config/config.env"});


app.listen(process.env.port, ()=>{
    console.log(`Server is up on port: ${process.env.port}`);
})
connectDB();