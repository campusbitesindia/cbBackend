const dotenv = require("dotenv");
dotenv.config({path: "./config/config.env"});

const app = require("./app");
const {connectDB} = require("./config/database");

app.listen(process.env.PORT, ()=>{
    console.log(`Server is up on port: ${process.env.PORT}`);
})
connectDB();