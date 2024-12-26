const mongoose = require("mongoose");

const borrowRequestSchema = new mongoose.Schema(
    {
        book: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Book", 
            required: true 

        },
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 

        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        requestDate: { 
            type: Date, 
            default: Date.now 

        },
        returned: { type: Boolean, default: false },
        approvalDate: { type: Date },
        rejectionReason: { type: String },
        returnDate: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.model("BorrowRequest", borrowRequestSchema);
