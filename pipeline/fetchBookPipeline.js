const mongoose = require('mongoose');

const fetchBookPipeline = (userId, search, pageLimit, currentPage) => {
    // Prepare the match filter if search term is provided
    const sanitizedSearch = typeof search === "string" ? search : "";

    const filter = sanitizedSearch
    ? {
        $or: [
            { title: { $regex: sanitizedSearch, $options: "i" } },
            { author: { $regex: sanitizedSearch, $options: "i" } },
            { genre: { $regex: sanitizedSearch, $options: "i" } },
        ],
    }
    : {}; 

    // Aggregation pipeline
    const pipeline = [
        // Filter books based on search criteria
        { $match: filter },

        // Add pagination: skip and limit
        { $skip: (currentPage - 1) * pageLimit },
        { $limit: pageLimit },

        // Lookup borrow requests for the specific user
        {
            $lookup: {
                from: "borrowrequests",  // BorrowRequest collection
                let: { bookId: "$_id", userId: new mongoose.Types.ObjectId(userId) },  // Pass bookId and userId
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$book", "$$bookId"] },  // Match bookId
                                    { $eq: ["$user", "$$userId"] }   // Match userId
                                ]
                            }
                        }
                    },
                    { $project: { status: 1, _id: 1 } }  // Project only status and _id from BorrowRequest
                ],
                as: "borrowRequests"  // Store matched borrow requests in this field
            }
        },

        // Add debugging field to check borrowRequests array size
        {
            $addFields: {
                debugBorrowRequests: { $size: { $ifNull: ["$borrowRequests", []] } }
            }
        },

        // Unwind borrowRequests to flatten the array if necessary
        {
            $unwind: {
                path: "$borrowRequests",
                preserveNullAndEmptyArrays: true  // Keep the document even if no borrow request exists
            }
        },

        // Project the final result (book details + borrow status)
        {
            $project: {
                title: 1,
                author: 1,
                genre: 1,
                copiesAvailable: 1,
                userBorrowStatus: { $ifNull: ["$borrowRequests.status", null] },
                borrowId: { $ifNull: ["$borrowRequests._id", null] },
                debugBorrowRequests: 1  // Debug field to see borrowRequests size
            }
        }
    ];

    return pipeline;
};

module.exports = fetchBookPipeline;