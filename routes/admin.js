const express = require("express")
const adminRoute = express.Router()

const userInfoFromJWT = require("../middlewares/userInfoFromJWT")
const Book = require("../models/book")
const validateBook = require("../helpers/bookDataValidator")
const adminValidation = require("../middlewares/adminValidation")
const fetchBooks = require("../common/fetchBook")


// TO ADD NEW BOOK IN DB
adminRoute.post("/books",userInfoFromJWT,adminValidation,async(req,res)=>{
    try {
       const error =  validateBook(req.body)

       if(error){
        throw new Error("something went wrong: " +error)
       }
        const bookData = req.body

        const saveBookInDb = await Book(bookData)
        await saveBookInDb.save()

        res.json({message:"Book added Successfully"})
    } catch (error) {
     res.status(400).json({
        message: "Something went wrong",
        error: error.message,
    });
    }
})

// TO FETCH ALL BOOK FROM DB
adminRoute.get("/books",userInfoFromJWT,adminValidation,async(req,res)=>{

    await fetchBooks(req,res)
})

adminRoute.put("/books",userInfoFromJWT,adminValidation,async(req,res)=>{
    try {
        const {bookId,newTitle} = req.body

        const updateBook = await Book.findByIdAndUpdate(bookId,{title:newTitle})
        if(!updateBook){
            throw new Error("something went wrong : please pass valid data")
        }

        res.json({message:"Book updated successfully"})
    } catch (error) {
        res.status(400).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
})

adminRoute.delete("/books/:id",userInfoFromJWT,adminValidation,async(req,res)=>{
    try {
        const bookId = req.params.id
        if(!bookId){
            throw new Error("please pass the id")
        }
        const findById = await Book.findById(bookId)
            if(!findById){
                throw new Error("book not found,please pass correct details")
            }

            const deleteBook = await Book.findByIdAndDelete(bookId)

            if(!deleteBook){
                throw new Error("something want wrong")
            }

            res.json({message:"Book deleted successfully"})
    } catch (error) {
        res.status(400).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
})


module.exports = adminRoute