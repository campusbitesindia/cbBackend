const dotenv = require("dotenv");
const app = require("./app");
const {connectDB} = require("./config/database");

dotenv.config({path: "./config/config.env"});


app.listen(process.env.PORT, ()=>{
    console.log(`Server is up on port: ${process.env.PORT}`);
})
connectDB();