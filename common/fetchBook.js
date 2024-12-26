const Book = require("../models/book");
const BorrowRequest = require("../models/borrowRequest");

const fetchBooks = async (req, res) => {
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
        // Role-specific logic
        if (req.user.role === "user") {
            const borrowRequests = await BorrowRequest.find({ user: req.user._id });

            const borrowLookup = borrowRequests.reduce((acc, req) => {
                acc[req.book.toString()] = { status: req.status, borrowId: req._id };
                return acc;
            }, {});
            // Add borrow/request status to each book
            const booksWithStatus = books.map((book) => {
                const borrowInfo = borrowLookup[book._id.toString()];
                return {
                    ...book.toObject(),
                    userBorrowStatus: borrowInfo ? borrowInfo.status : null, 
                    borrowId: borrowInfo ? borrowInfo.borrowId : null, 
                };
            });

            return res.json({
                message: "Books fetched successfully",
                data: booksWithStatus,
                totalBooks,
                totalPages: Math.ceil(totalBooks / pageLimit),
                currentPage,
            });
        }

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
};

module.exports = fetchBooks