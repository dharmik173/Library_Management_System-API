const Joi = require('joi');

const validateBook = (bookData) => {
    const schema = Joi.object({
        title: Joi.string().required().messages({
            "string.base": '"title" must be a string',
            "any.required": '"title" is required',
        }),
        author: Joi.string().required().messages({
            "string.base": '"author" must be a string',
            "any.required": '"author" is required',
        }),
        genre: Joi.string().required().messages({
            "string.base": '"genre" must be a string',
            "any.required": '"genre" is required',
        }),
        publishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).required().messages({
            "number.base": 'publishedYear must be a number',
            "number.integer": 'publishedYear must be an integer',
            "number.min": 'publishedYear must be a valid year',
            "number.max": 'publishedYear must not exceed the current year',
            "any.required": 'publishedYear is required',
        }),
        copiesAvailable: Joi.number()
            .integer()
            .min(0)
            .required()
            .less(Joi.ref('totalCopies'))
            .messages({
                "number.base": 'copiesAvailable must be a number',
                "number.integer": 'copiesAvailable must be an integer',
                "number.min": 'copiesAvailable must be at least 0',
                "number.less": 'copiesAvailable must be less than or equal to totalCopies',
                "any.required": 'copiesAvailable is required',
            }),
        totalCopies: Joi.number()
            .integer()
            .min(0)
            .required()
            .messages({
                "number.base": 'totalCopies must be a number',
                "number.integer": 'totalCopies must be an integer',
                "number.min": 'totalCopies must be at least 0',
                "any.required": 'totalCopies is required',
            }),
    });

    const { error } = schema.validate(bookData, { abortEarly: false });

    if (error) {
        // Map validation errors into a readable array
        const errors = error.details.map((detail) => detail.message);
        return errors;
    }
    return null; // No errors
};


module.exports = validateBook
