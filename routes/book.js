const express = require("express")

const userInfoFromJWT = require("../middlewares/userInfoFromJWT")
const Book = require("../models/book")
const BorrowRequest = require("../models/borrowRequest")
const bookRoute = express.Router()


bookRoute.post("/borrow",userInfoFromJWT,async(req,res)=>{
    try {
        const {bookId} = req.body
        const userId = req.user._id
        console.log('userId: ', userId);
        if(!bookId){
            return res.status(400).json({ message: "Book ID is required." });
        }
        const findBookInDb = await Book.findById(bookId)
        if(!findBookInDb){
            return res.status(404).json({ message: "Book not found." });
        }

        if (findBookInDb.copiesAvailable <= 0) {
            return res.status(400).json({ message: "No copies available for this book." });
        }

        const activeBorrowedBooks = await BorrowRequest.find({
            user: userId,
            status: "Approved",
            returned: false, 
        });
        
        
        if (activeBorrowedBooks.length >= 5) {
            return res
                .status(400)
                .json({ message: "You already have 5 borrowed books. Return some to borrow more." });
        }

        const existingRequest = await BorrowRequest.findOne({
            book: bookId,
            user: userId,
            status: { $in: ["Pending", "Approved"] },
        });

        if(existingRequest){
            return res.status(400).json({ message: "You already have a pending or approved request for this book." });
        }

        const newRequest = new BorrowRequest({
            book: bookId,
            user: userId,
        });

        await newRequest.save();

        res.status(201).json({ message: "Borrow request created successfully.", data: newRequest });
    } catch (error) {
        res.status(400).json({ message: "Something went wrong: " + error.message });
    }
})

bookRoute.get("/borrow/view-all",userInfoFromJWT,async(req,res)=>{
    try {

        const userId = req.user._id
        console.log('userId: ', userId);

        const activeBorrowedBooks = await BorrowRequest.find({
            user: userId,
        });

        res.status(200).json({ message: "Fetched All request", data: activeBorrowedBooks });
        
    } catch (error) {
        res.status(400).json({ message: "Something went wrong: " + error.message });
        
    }
})

bookRoute.delete("/borrow/:bookId",userInfoFromJWT,async(req,res)=>{
    try {
        const bookId = req.params.bookId
        console.log('bookId: ', bookId);
        const userId = req.user._id
        if(!bookId){
            return res.status(400).json({ message: "bookId should not be empty" });
        }

        const findBorrowRequest = await BorrowRequest.findOne({book:bookId,user:userId})
        if(!findBorrowRequest){
            return res.status(400).json({ message: "Request not found or already Approved" });
        }
        const deleteBorrowRequest = await BorrowRequest.findByIdAndDelete(findBorrowRequest._id)

        res.status(200).json({message:"request cancelled successfully"})
    } catch (error) {
        res.status(400).json({ message: "Something went wrong: " + error.message });
        
    }
})

module.exports =bookRoute