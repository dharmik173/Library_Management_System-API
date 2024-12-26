const express = require("express")
const authRoute = express.Router()
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const userValidation = require("../helpers/userValidation")
const User = require("../models/user")
const userAuth = require("../middlewares/userAuth")



authRoute.post("/signup",async(req,res)=>{
        try {
        // CHECKING USER MAIL AND PASSWORD IS VALID OR NOT
            userValidation(req.body)

             // CONVERTING PASSWORD INTO HASH
            const userPassword = req.body.password
            const hashPassword = await bcrypt.hash(userPassword,10)

            let userData = req.body
            userData.password =hashPassword

        const saveUserInDb = await User(userData)
                const userAdded = await saveUserInDb.save()

            res.json({message:"user added successfully"})
        } catch (error) {
            res.status(400).json({ message: "Something went wrong: " + error.message });
        }
})

authRoute.post("/login",userAuth,async(req,res)=>{
    try {
        
        const user = req.user
        let token = jwt.sign(user, process.env.JWT_SECRET);

        res.json({message:"login successfully",token,user})
    } catch (error) {
        res.status(401).json({ message: "Something went wrong: " + error.message });
        
    }
})

module.exports = authRoute