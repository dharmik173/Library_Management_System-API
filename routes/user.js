const express = require("express")
const userRoute = express.Router()
const mongoose = require('mongoose');  // Make sure mongoose is required

const userInfoFromJWT = require("../middlewares/userInfoFromJWT")
const Book = require("../models/book");
const BorrowRequest = require("../models/borrowRequest");
const fetchBookPipeline = require("../pipeline/fetchBookPipeline")


userRoute.get("/books",userInfoFromJWT,async(req,res)=>{
    try {
        const { search="", limit, page } = req.query;
        const pageLimit = limit ? parseInt(limit) : 10;
        const currentPage = page ? parseInt(page) : 1;
        const skip = (currentPage - 1) * pageLimit;

        // Base filter for search functionality
        
        const userId = req.user._id

        const pipeline = fetchBookPipeline(userId, search, pageLimit, currentPage);

        // Execute the aggregation pipeline
        const books = await Book.aggregate(pipeline);

        // Calculate total number of books (without pagination)
        const totalBooks = await Book.countDocuments({
            $or: [
                { title: { $regex: search, $options: "i" } },
                { author: { $regex: search, $options: "i" } },
                { genre: { $regex: search, $options: "i" } }
            ]
        });

        return res.json({
            message: "Books fetched successfully",
            data: books,
            totalBooks,
            totalPages: Math.ceil(totalBooks / pageLimit),
            currentPage,
        });
    } catch (error) {
        res.status(400).json({ message: "Something went wrong", error: error.message });
    }
})

module.exports = userRoute