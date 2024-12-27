const express = require("express")
const adminRoute = express.Router()

const userInfoFromJWT = require("../middlewares/userInfoFromJWT")
const Book = require("../models/book")
const validateBook = require("../helpers/bookDataValidator")
const adminValidation = require("../middlewares/adminValidation")
const fetchBooks = require("../common/fetchBook")
const BorrowRequest = require("../models/borrowRequest")


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

    try {
        const { search, limit, page } = req.query;
        const pageLimit = limit ? parseInt(limit) : 10;
        const currentPage = page ? parseInt(page) : 1;
        const skip = (currentPage - 1) * pageLimit;

        // Base filter for search functionality
        const filter = search
            ? {
                  $or: [
                      { title: { $regex: search, $options: "i" } },
                      { author: { $regex: search, $options: "i" } },
                      { genre: { $regex: search, $options: "i" } },
                  ],
              }
            : {};

        // Fetch books with pagination
        const books = await Book.find(filter).skip(skip).limit(pageLimit);
        const totalBooks = await Book.countDocuments(filter);

        // For admins, return plain book data
        res.json({
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

// TO EDIT BOOK IN DB
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

// TO DELETE BOOK FROM DB
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

// TO VIEW ALL BORROW REQUEST OF USER 
adminRoute.get("/borrow/view-all",userInfoFromJWT,adminValidation,async(req,res)=>{
    try {
        const viewAllReq = await BorrowRequest.find()

       res.json({message:"all request fetched successfully",data:viewAllReq})
    } catch (error) {
        res.status(400).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
})

// TO APPROVE OR REJECT BORROW REQUEST OF USER 
adminRoute.post("/borrow/:status",userInfoFromJWT,adminValidation,async(req,res)=>{
    try {
        const status = req.params.status
        const reqId = req.body.requestId

        if(!reqId){
            throw new Error("request id is empty")
        }
        if (status !== "Approved" && status !== "Rejected") {
            throw new Error("Please pass the correct status");
        }

        const findReq = await BorrowRequest.findOne({_id:reqId,status:"Pending"})
            if(!findReq){
            throw new Error("Request not found you already Approved or Rejected this request ")
            }

            findReq.status =status
            const UpdateReq = await BorrowRequest.findByIdAndUpdate(reqId,findReq)
            // updating the count after successfully Approved request
            if(UpdateReq &&status==="Approved" ){
                const findBookAndUpdateCount = await Book.findByIdAndUpdate(   
                    { _id: findReq.book },
                    { $inc: { copiesAvailable: -1 } },
                )
            }

        res.json({message:`you successfully ${status} this request`})
    } catch (error) {
         res.status(400).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
})



module.exports = adminRoute