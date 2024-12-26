const express = require("express")
const userRoute = express.Router()

const userInfoFromJWT = require("../middlewares/userInfoFromJWT")
const fetchBooks = require("../common/fetchBook")


userRoute.get("/books",userInfoFromJWT,async(req,res)=>{
    await fetchBooks(req,res)
})

module.exports = userRoute