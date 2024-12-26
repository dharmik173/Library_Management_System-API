const express = require("express")
const cookieParser = require("cookie-parser");
const cors = require('cors');

const connectDB = require('./MongoDb/connection');
const authRoute = require("./routes/auth")
const adminRoute = require("./routes/admin")
const bookRoute = require("./routes/book");
const userRoute = require("./routes/user");

const app = express()
const PORT = 3006
require("dotenv").config();

app.use(express.json());
app.use(cookieParser());



app.use('/auth',authRoute)
app.use('/admin',adminRoute)
app.use('/book',bookRoute)
app.use('/user',userRoute)


connectDB().then(()=>{
    console.log("Database connection established...");
    app.listen(PORT , ()=>{
      console.log(`Server is successfully listening on port ${PORT}...`);
    })
}).catch(()=>{
    console.error("Database cannot be connected!!");

})